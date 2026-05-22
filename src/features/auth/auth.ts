import 'server-only'
import { cookies, headers } from 'next/headers'
import NextAuth, { type NextAuthConfig } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import Google from 'next-auth/providers/google'
import Facebook from 'next-auth/providers/facebook'
import Nodemailer from 'next-auth/providers/nodemailer'
import { PrismaAdapter } from '@auth/prisma-adapter'
import type { UserRole } from '@prisma/client'
import { prisma } from '@/lib/db'
import { env } from '@/lib/env'
import { verifyPassword } from '@/lib/auth/password'
import { extractRequestInfo } from '@/lib/auth/request-info'
import { rateLimiters } from '@/lib/rate-limit'
import { recordLoginEvent } from './services/record-login-event'
import { verifyTotpForSignIn } from './services/totp'
import { SIGNUP_ROLE_COOKIE_NAME } from './constants'
import { loginSchema } from './schemas'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: UserRole
      email?: string | null
      name?: string | null
      image?: string | null
    }
  }
  interface User {
    role?: UserRole
  }
}

declare module '@auth/core/jwt' {
  interface JWT {
    sub?: string
    role?: UserRole
  }
}

const providers: NextAuthConfig['providers'] = [
  Credentials({
    name: 'credentials',
    credentials: {
      email: { label: 'Email', type: 'email' },
      password: { label: 'Mot de passe', type: 'password' },
      totpCode: { label: 'Code 2FA', type: 'text' },
    },
    async authorize(credentials, request) {
      const parsed = loginSchema.safeParse(credentials)
      if (!parsed.success) return null

      // Rate limit per client IP (10 / 5min). Fails open if Upstash not configured.
      // Fail-CLOSED on null IP — bucket unattributable login attempts together
      // so missing X-Forwarded-For headers can't be used to bypass the cap.
      if (request) {
        const { ipHash } = extractRequestInfo(request.headers)
        const rl = await rateLimiters.login(ipHash ?? 'noip:login')
        if (!rl.success) {
          console.warn('[auth] rate limited login')
          return null
        }
      }

      const user = await prisma.user.findUnique({
        where: { email: parsed.data.email },
        select: {
          id: true,
          email: true,
          name: true,
          image: true,
          role: true,
          passwordHash: true,
          status: true,
          totpEnabledAt: true,
          emailVerified: true,
        },
      })
      if (!user || !user.passwordHash || user.status !== 'ACTIVE') return null

      const ok = await verifyPassword(parsed.data.password, user.passwordHash)
      if (!ok) return null

      // Defense-in-depth : block credentials sign-in for unverified
      // emails even if the signInAction preflight was bypassed (e.g.
      // someone hitting /api/auth/callback/credentials directly).
      // OAuth providers are exempt — they set emailVerified upstream.
      if (user.emailVerified === null) return null

      // 2FA enforcement: if user has TOTP enabled, the credentials payload
      // MUST include a valid totpCode (6-digit TOTP or XXXX-XXXX recovery).
      // The signInAction does a pre-flight check that surfaces a friendly
      // "need TOTP" state to the form; this layer is defense-in-depth so
      // hitting /api/auth/callback/credentials directly cannot bypass 2FA.
      if (user.totpEnabledAt) {
        if (!parsed.data.totpCode) return null
        const totpOk = await verifyTotpForSignIn({
          userId: user.id,
          code: parsed.data.totpCode,
        })
        if (!totpOk) return null
      }

      // Record login event with full request info (IP hash, UA).
      await recordLoginEvent({
        userId: user.id,
        authMethod: 'CREDENTIALS',
        request,
      }).catch((err) => console.error('[recordLoginEvent credentials]', err))

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
        role: user.role,
      }
    },
  }),
]

if (env.GMAIL_USER && env.GMAIL_APP_PASSWORD) {
  providers.push(
    Nodemailer({
      server: {
        host: 'smtp.gmail.com',
        port: 465,
        auth: { user: env.GMAIL_USER, pass: env.GMAIL_APP_PASSWORD },
      },
      from: env.EMAIL_FROM ?? env.GMAIL_USER,
      // Rate-limit BEFORE sending so an attacker cannot spam arbitrary
      // inboxes via our Gmail relay (DoS + Gmail-rep damage). 3/email/h
      // + 10/IP/h matches the forgot-password ceiling — both are
      // outbound-email actions reachable without authentication.
      async sendVerificationRequest({ identifier, url, provider }) {
        const h = await headers()
        const { ipHash } = extractRequestInfo(h)
        // Fail-CLOSED on missing IP: bucket all no-IP traffic together so
        // an absent x-forwarded-for header can't grant unlimited sends.
        const rl = await rateLimiters.signInEmail(
          identifier,
          ipHash ?? 'noip:signin-email',
        )
        if (!rl.success) {
          throw new Error('Trop de tentatives. Réessaie dans une heure.')
        }
        const nodemailer = await import('nodemailer')
        const transport = nodemailer.createTransport(provider.server)
        await transport.sendMail({
          to: identifier,
          from: provider.from,
          subject: 'Connexion à AryTrano',
          text: `Bonjour,\n\nClique sur ce lien pour te connecter à AryTrano :\n${url}\n\nSi tu n'as pas demandé ce lien, ignore cet email.\n`,
          html: `
            <p>Bonjour,</p>
            <p>Clique sur ce lien pour te connecter à AryTrano :</p>
            <p><a href="${url}">${url}</a></p>
            <p style="color:#666;font-size:12px">Si tu n'as pas demandé ce lien, ignore cet email.</p>
          `,
        })
      },
    }),
  )
}

if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    Google({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      // Google verifies emails, so it's safe to auto-link the Google
      // account to an existing User created via Credentials/email magic link.
      // Without this, Auth.js throws OAuthAccountNotLinked.
      allowDangerousEmailAccountLinking: true,
    }),
  )
}

if (env.FACEBOOK_CLIENT_ID && env.FACEBOOK_CLIENT_SECRET) {
  providers.push(
    Facebook({
      clientId: env.FACEBOOK_CLIENT_ID,
      clientSecret: env.FACEBOOK_CLIENT_SECRET,
      // NOT enabling allowDangerousEmailAccountLinking on Facebook: unlike
      // Google, Facebook does not guarantee email is verified. An attacker
      // with a FB account using a victim's email could otherwise take over
      // the AryTrano account via Facebook OAuth.
    }),
  )
}

export const authConfig = {
  adapter: PrismaAdapter(prisma),
  providers,
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/sign-in',
    error: '/auth-error',
    verifyRequest: '/verify-email',
  },
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.sub = user.id
        if (user.role) token.role = user.role
      }
      // On OAuth sign-up the `user.role` we just baked into the token is the
      // schema default (STUDENT) — it was captured BEFORE events.createUser
      // ran and applied the role chosen on the sign-up page. Re-read from DB
      // so the JWT reflects the post-event state.
      if (trigger === 'signUp' && token.sub) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub },
          select: { role: true },
        })
        if (dbUser) token.role = dbUser.role
      }
      if (token.sub && !token.role) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub },
          select: { role: true },
        })
        if (dbUser) token.role = dbUser.role
      }
      return token
    },
    async session({ session, token }) {
      if (token.sub) session.user.id = token.sub
      if (token.role) session.user.role = token.role
      return session
    },
  },
  events: {
    /**
     * Fires when the OAuth / magic-link callback creates a new User row.
     * The user picked a role on the sign-up page (STUDENT or OWNER) — we
     * stored it in a short-lived cookie before redirecting to the provider.
     * Apply that role here, then clear the cookie so it does not leak into
     * subsequent sign-ups on the same browser.
     */
    async createUser({ user }) {
      if (!user.id) return
      try {
        const c = await cookies()
        const intended = c.get(SIGNUP_ROLE_COOKIE_NAME)?.value
        if (intended === 'OWNER' || intended === 'STUDENT') {
          await prisma.user.update({
            where: { id: user.id },
            data: { role: intended },
          })
        }
        c.delete(SIGNUP_ROLE_COOKIE_NAME)
      } catch (err) {
        // Never block account creation if the role bridge fails — fall back
        // to the schema default (STUDENT). User can change role later in /settings.
        console.error('[events.createUser] role bridge failed', err)
      }
    },
    // Recorded for OAuth + magic-link sign-ins. Credentials are already
    // recorded in the authorize() callback (which has access to the request,
    // so we get IP/UA there but not here).
    async signIn({ user, account }) {
      if (!user?.id || !account) return

      // Sweep the signup-role cookie on EVERY successful sign-in so a stale
      // cookie from an abandoned signup flow can't leak into the next
      // createUser on a shared device.
      try {
        const c = await cookies()
        if (c.get(SIGNUP_ROLE_COOKIE_NAME)) {
          c.delete(SIGNUP_ROLE_COOKIE_NAME)
        }
      } catch {
        /* cookies() may throw in some adapter contexts — ignore */
      }

      if (account.provider === 'credentials') return // already recorded

      const method =
        account.provider === 'google'
          ? 'GOOGLE'
          : account.provider === 'facebook'
            ? 'FACEBOOK'
            : account.provider === 'nodemailer'
              ? 'MAGIC_LINK'
              : null
      if (!method) return

      await recordLoginEvent({
        userId: user.id,
        authMethod: method,
        // No request access from events.signIn — IP / UA will be null.
      }).catch((err) => console.error('[recordLoginEvent event]', err))
    },
  },
} satisfies NextAuthConfig

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig)
