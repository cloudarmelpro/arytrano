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

export default function SignIn() {
  const { login } = useAuth()
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
        if (key === 'email') fieldErrors.email = 'Email invalide'
        if (key === 'password') fieldErrors.password = 'Mot de passe requis'
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
        setErrors({ form: 'Email ou mot de passe incorrect.' })
      } else {
        setErrors({ form: 'Connexion impossible. Réessaie.' })
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
            accessibilityLabel="Retour"
          >
            <Text className="text-base text-muted-foreground">← Retour</Text>
          </Pressable>

          <Text className="font-serif text-3xl text-foreground">Connexion</Text>
          <Text className="mt-2 text-base text-muted-foreground">
            Retrouve tes recherches sauvegardées et tes favoris.
          </Text>

          <View className="mt-8 flex flex-col gap-4">
            <Field
              label="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              textContentType="emailAddress"
              error={errors.email}
            />
            <Field
              label="Mot de passe"
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
              title="Se connecter"
              onPress={onSubmit}
              loading={submitting}
            />
          </View>

          <View className="mt-8 flex-row items-center justify-center gap-1">
            <Text className="text-sm text-muted-foreground">
              Pas encore de compte ?
            </Text>
            <Link
              href="/sign-up"
              replace
              accessibilityLabel="Créer un compte"
            >
              <Text className="text-sm font-semibold text-primary">
                Créer un compte
              </Text>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
