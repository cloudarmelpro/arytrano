import { useMutation } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, useLocalSearchParams } from 'expo-router'
import { ApiError, initiateLease } from '@/lib/api/client'
import { useAuth } from '@/lib/auth/use-auth'
import { Button } from '@/components/ui/Button'

/**
 * S2-10 — Mobile owner lease wizard.
 *
 * Reached with `?listingId=<id>` (push from the owner's own listing
 * detail screen when they tap "Créer un bail"). The form collects the
 * minimum the server needs ; cautionMGA and platformFeeMGA are derived
 * server-side from the listing, so the wizard stays slim.
 *
 * Web parity : `/dashboard/listings/[id]/lease/new`. Server uses the
 * same `initiateLease` service.
 *
 * After success the screen navigates to `/leases/[id]` so the owner
 * can monitor the tenant acceptance. The tenant receives an invite
 * email and accepts (+ pays) from their own device.
 */

function todayIso(): string {
  const d = new Date()
  const yyyy = d.getUTCFullYear()
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0')
  const dd = String(d.getUTCDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

export default function NewLeaseScreen() {
  const { listingId } = useLocalSearchParams<{ listingId: string }>()
  const { signedIn, isLoading: authLoading } = useAuth()
  const [tenantEmail, setTenantEmail] = useState('')
  const [startDate, setStartDate] = useState(todayIso())
  const [durationStr, setDurationStr] = useState('12')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !signedIn) router.replace('/sign-in')
  }, [authLoading, signedIn])

  const mutation = useMutation({
    mutationFn: async () => {
      setError(null)
      if (!listingId) throw new Error('Missing listingId')
      const duration = Number.parseInt(durationStr, 10)
      if (!Number.isInteger(duration) || duration < 1 || duration > 60) {
        throw new Error('Durée invalide (1-60 mois).')
      }
      if (!tenantEmail.includes('@')) {
        throw new Error('Email locataire invalide.')
      }
      // The server expects an ISO datetime. Pad the date with midnight
      // UTC so the server's Zod `datetime()` schema accepts it.
      const startIso = new Date(`${startDate}T00:00:00Z`).toISOString()
      return initiateLease({
        listingId,
        tenantEmail,
        startDate: startIso,
        durationMonths: duration,
      })
    },
    onSuccess: (data) => {
      router.replace(`/leases/${data.leaseId}`)
    },
    onError: (err) => {
      if (err instanceof ApiError) {
        if (err.fields?.tenantEmail) {
          setError(err.fields.tenantEmail[0] ?? err.message)
        } else {
          setError(err.message)
        }
      } else if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Erreur inattendue.')
      }
    },
  })

  if (authLoading) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center' }}>
        <ActivityIndicator />
      </SafeAreaView>
    )
  }

  if (!listingId) {
    return (
      <SafeAreaView style={{ flex: 1, padding: 24 }}>
        <Text style={{ fontSize: 16, color: '#666' }}>
          Annonce manquante. Reviens à la page de l’annonce et
          retape « Créer un bail ».
        </Text>
        <View style={{ marginTop: 16 }}>
          <Button onPress={() => router.back()} title="Retour" />
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView contentContainerStyle={{ padding: 24, gap: 20 }}>
        <Text
          style={{
            fontSize: 28,
            fontWeight: '500',
            color: '#0a0a0a',
            letterSpacing: -0.4,
          }}
        >
          Nouveau bail
        </Text>
        <Text style={{ fontSize: 14, color: '#666', lineHeight: 20 }}>
          Indique l’email du locataire et les dates. Le locataire recevra
          une invitation et paiera 20 % du loyer mensuel à AryTrano au
          moment de l’acceptation. Toi tu ne paies rien.
        </Text>

        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 13, fontWeight: '600', color: '#333' }}>
            Email du locataire
          </Text>
          <TextInput
            value={tenantEmail}
            onChangeText={setTenantEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="locataire@example.mg"
            placeholderTextColor="#999"
            style={{
              borderWidth: 1,
              borderColor: '#ddd',
              borderRadius: 8,
              padding: 12,
              fontSize: 15,
            }}
            editable={!mutation.isPending}
          />
        </View>

        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 13, fontWeight: '600', color: '#333' }}>
            Date de début (AAAA-MM-JJ)
          </Text>
          <TextInput
            value={startDate}
            onChangeText={setStartDate}
            autoCapitalize="none"
            placeholder="2026-06-01"
            placeholderTextColor="#999"
            style={{
              borderWidth: 1,
              borderColor: '#ddd',
              borderRadius: 8,
              padding: 12,
              fontSize: 15,
              fontFamily: 'monospace',
            }}
            editable={!mutation.isPending}
          />
        </View>

        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 13, fontWeight: '600', color: '#333' }}>
            Durée (mois)
          </Text>
          <TextInput
            value={durationStr}
            onChangeText={setDurationStr}
            keyboardType="number-pad"
            placeholder="12"
            placeholderTextColor="#999"
            style={{
              borderWidth: 1,
              borderColor: '#ddd',
              borderRadius: 8,
              padding: 12,
              fontSize: 15,
            }}
            editable={!mutation.isPending}
          />
        </View>

        {error ? (
          <View
            style={{
              borderWidth: 1,
              borderColor: 'rgba(220,38,38,0.3)',
              backgroundColor: 'rgba(220,38,38,0.05)',
              borderRadius: 8,
              padding: 12,
            }}
          >
            <Text style={{ color: '#b91c1c', fontSize: 13.5 }}>{error}</Text>
          </View>
        ) : null}

        <View style={{ marginTop: 8, gap: 12 }}>
          <Button
            onPress={() => mutation.mutate()}
            title={mutation.isPending ? 'Création…' : 'Créer le bail'}
            disabled={mutation.isPending}
          />
          <Pressable onPress={() => router.back()} disabled={mutation.isPending}>
            <Text style={{ textAlign: 'center', color: '#666', fontSize: 14 }}>
              Annuler
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
