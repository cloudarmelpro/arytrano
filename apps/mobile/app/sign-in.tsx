import { useState } from 'react'
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Link, router } from 'expo-router'
import { loginRequestSchema } from '@arytrano/shared'
import { Button } from '@/components/ui/Button'
import { Field } from '@/components/ui/Field'
import { ApiError } from '@/lib/api/client'
import { useAuth } from '@/lib/auth/use-auth'
import { useT } from '@/lib/i18n/use-locale'

export default function SignIn() {
  const { login } = useAuth()
  const t = useT()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({})
  const [submitting, setSubmitting] = useState(false)

  async function onSubmit() {
    setErrors({})
    const parsed = loginRequestSchema.safeParse({ email, password })
    if (!parsed.success) {
      // Map Zod issues back to per-field errors. Keep the messages
      // generic — the server is the source of truth on whether the
      // credentials are valid.
      const fieldErrors: typeof errors = {}
      for (const issue of parsed.error.issues) {
        const key = issue.path[0]
        if (key === 'email') fieldErrors.email = t('signIn.field.email')
        if (key === 'password') fieldErrors.password = t('signIn.field.password')
      }
      setErrors(fieldErrors)
      return
    }

    setSubmitting(true)
    try {
      await login(parsed.data)
      router.replace('/')
    } catch (err) {
      if (err instanceof ApiError) {
        // Generic message — don't echo "user not found" vs "wrong
        // password" (the web does the same — protects against email
        // enumeration).
        setErrors({ form: t('signIn.error.invalid') })
      } else {
        setErrors({ form: t('signIn.error.network') })
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerClassName="flex-grow px-6 py-8"
        >
          <Pressable
            onPress={() => router.back()}
            className="-ml-2 mb-6 self-start p-2"
            accessibilityLabel={t('common.back')}
          >
            <Text className="text-base text-muted-foreground">
              {t('common.back')}
            </Text>
          </Pressable>

          <Text className="font-serif text-3xl text-foreground">
            {t('signIn.title')}
          </Text>
          <Text className="mt-2 text-base text-muted-foreground">
            {t('signIn.lead')}
          </Text>

          <View className="mt-8 flex flex-col gap-4">
            <Field
              label={t('signIn.field.email')}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              textContentType="emailAddress"
              error={errors.email}
            />
            <Field
              label={t('signIn.field.password')}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoComplete="current-password"
              textContentType="password"
              error={errors.password}
            />

            {errors.form ? (
              <View className="rounded-xl bg-red-50 p-3">
                <Text className="text-sm text-red-900">{errors.form}</Text>
              </View>
            ) : null}

            <Button
              title={t('signIn.cta')}
              onPress={onSubmit}
              loading={submitting}
            />
          </View>

          <View className="mt-8 flex-row items-center justify-center gap-1">
            <Text className="text-sm text-muted-foreground">
              {t('signIn.noAccount')}
            </Text>
            <Link
              href="/sign-up"
              replace
              accessibilityLabel={t('signIn.createAccount')}
            >
              <Text className="text-sm font-semibold text-primary">
                {t('signIn.createAccount')}
              </Text>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
