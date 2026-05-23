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
import { registerRequestSchema } from '@arytrano/shared'
import { Button } from '@/components/ui/Button'
import { Field } from '@/components/ui/Field'
import { ApiError } from '@/lib/api/client'
import { useAuth } from '@/lib/auth/use-auth'
import { useT } from '@/lib/i18n/use-locale'

export default function SignUp() {
  const { register } = useAuth()
  const t = useT()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{
    name?: string
    email?: string
    password?: string
    form?: string
  }>({})
  const [submitting, setSubmitting] = useState(false)

  async function onSubmit() {
    setErrors({})
    const parsed = registerRequestSchema.safeParse({ name, email, password })
    if (!parsed.success) {
      const fieldErrors: typeof errors = {}
      for (const issue of parsed.error.issues) {
        const key = issue.path[0]
        if (key === 'name') fieldErrors.name = t('signUp.field.name')
        if (key === 'email') fieldErrors.email = t('signUp.field.email')
        if (key === 'password')
          fieldErrors.password = t('signUp.field.passwordHelper')
      }
      setErrors(fieldErrors)
      return
    }

    setSubmitting(true)
    try {
      await register(parsed.data)
      router.replace('/')
    } catch (err) {
      if (err instanceof ApiError && err.code === 'conflict') {
        setErrors({ form: t('signUp.error.exists') })
      } else if (err instanceof ApiError && err.fields) {
        // Server-side validation hit something we didn't catch locally
        // (e.g. tighter password policy server-side). Surface the
        // first issue field-specifically when possible.
        const fieldErrors: typeof errors = {}
        for (const [field, msgs] of Object.entries(err.fields)) {
          const m = msgs[0]
          if (m && (field === 'name' || field === 'email' || field === 'password')) {
            fieldErrors[field as 'name' | 'email' | 'password'] = m
          }
        }
        setErrors({ ...fieldErrors, form: err.message })
      } else {
        setErrors({ form: t('signUp.error.network') })
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
            {t('signUp.title')}
          </Text>
          <Text className="mt-2 text-base text-muted-foreground">
            {t('signUp.lead')}
          </Text>

          <View className="mt-8 flex flex-col gap-4">
            <Field
              label={t('signUp.field.name')}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              autoComplete="given-name"
              textContentType="givenName"
              error={errors.name}
            />
            <Field
              label={t('signUp.field.email')}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              textContentType="emailAddress"
              error={errors.email}
            />
            <Field
              label={t('signUp.field.password')}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoComplete="new-password"
              textContentType="newPassword"
              helperText={t('signUp.field.passwordHelper')}
              error={errors.password}
            />

            {errors.form ? (
              <View className="rounded-xl bg-red-50 p-3">
                <Text className="text-sm text-red-900">{errors.form}</Text>
              </View>
            ) : null}

            <Button
              title={t('signUp.cta')}
              onPress={onSubmit}
              loading={submitting}
            />
          </View>

          <View className="mt-8 flex-row items-center justify-center gap-1">
            <Text className="text-sm text-muted-foreground">
              {t('signUp.haveAccount')}
            </Text>
            <Link href="/sign-in" replace accessibilityLabel={t('signUp.signIn')}>
              <Text className="text-sm font-semibold text-primary">
                {t('signUp.signIn')}
              </Text>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
