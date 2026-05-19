import { handlers } from './auth'

export const { GET, POST } = handlers
export { auth, signIn, signOut } from './auth'
export { signUpSchema, loginSchema, refreshSchema, type SignUpInput, type LoginInput, type RefreshInput } from './schemas'
export { signOutAction } from './actions/sign-out'
// Client form components — safe re-exports (no `'server-only'` imports).
export { SignInClient } from './components/SignInClient'
export { SignUpClient } from './components/SignUpClient'
export { ForgotPasswordForm } from './components/ForgotPasswordForm'
export { ResetPasswordForm } from './components/ResetPasswordForm'
export { VerifiedOwnerBadge } from './components/VerifiedOwnerBadge'
