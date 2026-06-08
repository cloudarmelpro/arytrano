import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, useLocalSearchParams } from 'expo-router'
import type { LeaseDetail } from '@arytrano/shared'
import {
  ApiError,
  getLeaseById,
  refuseLease,
  signLease,
} from '@/lib/api/client'
import { useAuth } from '@/lib/auth/use-auth'
import { useT } from '@/lib/i18n/use-locale'
import { Button } from '@/components/ui/Button'
import type { MessageKey } from '@/lib/i18n/messages'

/**
 * Lease detail (E-T22 mobile).
 *
 * Three modes :
 *   - viewer is OWNER → read-only header + terms + status (waits for tenant)
 *   - viewer is TENANT + status PENDING_TENANT → Accept / Refuse CTAs
 *   - viewer is TENANT + any other status → read-only
 *
 * The mutations rely on the same Server Actions / REST handlers as the
 * web (`/api/v1/leases/[id]/sign` and `/refuse`). We refresh the list
 * cache on success so the user can tap Back and see the updated status
 * without pull-to-refreshing.
 */

const STATUS_KEY = {
  DRAFT: 'lease.status.DRAFT',
  PENDING_TENANT: 'lease.status.PENDING_TENANT',
  ACTIVE: 'lease.status.ACTIVE',
  REFUSED: 'lease.status.REFUSED',
  TERMINATED: 'lease.status.TERMINATED',
  DISPUTED: 'lease.status.DISPUTED',
} as const satisfies Record<LeaseDetail['status'], MessageKey>

function formatAriary(n: number): string {
  return new Intl.NumberFormat('fr-FR').format(n)
}

function formatStartDate(iso: string): string {
  return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' }).format(
    new Date(iso),
  )
}

export default function LeaseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { user, signedIn, isLoading: authLoading } = useAuth()
  const t = useT()
  const queryClient = useQueryClient()
  const [refuseOpen, setRefuseOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [outcome, setOutcome] = useState<'signed' | 'refused' | null>(null)

  useEffect(() => {
    if (!authLoading && !signedIn) router.replace('/sign-in')
  }, [authLoading, signedIn])

  const { data: lease, isLoading, error, refetch } = useQuery({
    queryKey: ['leases', id],
    queryFn: () => getLeaseById(id),
    enabled: signedIn && Boolean(id),
  })

  function onMutationSuccess(kind: 'signed' | 'refused') {
    setOutcome(kind)
    // Invalidate the list so a back-nav shows the fresh status.
    void queryClient.invalidateQueries({ queryKey: ['leases', 'mine'] })
    void refetch()
  }

  const signMutation = useMutation({
    mutationFn: () => signLease(id),
    onSuccess: (res) => {
      // E-T26 revised — the /sign endpoint now initiates a GoalPay
      // checkout and returns its URL. We hand the URL off to the OS
      // (external browser / Mobile Money app via deep link) so the
      // tenant completes the payment outside the Expo container.
      // After payment success, the webhook flips the lease to ACTIVE
      // server-side ; the user can tap back into the app and refresh
      // to see the new state.
      Linking.openURL(res.checkoutUrl).catch(() => {
        Alert.alert(
          t('lease.tenant.error.generic'),
          t('lease.tenant.error.checkoutOpen'),
        )
      })
      onMutationSuccess('signed')
    },
    onError: (err: unknown) => {
      const msg =
        err instanceof ApiError ? err.message : t('lease.tenant.error.generic')
      Alert.alert(t('lease.tenant.error.generic'), msg)
    },
  })

  const refuseMutation = useMutation({
    mutationFn: () => refuseLease(id, reason.trim() || undefined),
    onSuccess: () => onMutationSuccess('refused'),
    onError: (err: unknown) => {
      const msg =
        err instanceof ApiError ? err.message : t('lease.tenant.error.generic')
      Alert.alert(t('lease.tenant.error.generic'), msg)
    },
  })

  if (authLoading || (isLoading && !lease)) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator />
      </SafeAreaView>
    )
  }

  if (error || !lease) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white px-6">
        <Text className="text-base text-rose-600">
          {t('lease.tenant.error.generic')}
        </Text>
        <Pressable onPress={() => router.back()} className="mt-4">
          <Text className="text-base font-semibold text-neutral-900">
            {t('common.back')}
          </Text>
        </Pressable>
      </SafeAreaView>
    )
  }

  const viewerIsTenant = user?.id === lease.tenant.id
  const canTenantAct =
    viewerIsTenant && lease.status === 'PENDING_TENANT' && outcome === null
  const counterpart = viewerIsTenant ? lease.owner : lease.tenant
  const pending = signMutation.isPending || refuseMutation.isPending

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="border-b border-neutral-200 px-5 py-4">
        <Pressable onPress={() => router.back()}>
          <Text className="text-[13px] font-medium text-neutral-500">
            {t('common.back')}
          </Text>
        </Pressable>
        <Text className="mt-3 text-2xl font-bold text-neutral-900">
          {t('lease.detail.title')}
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
        {/* Status pill — same vocabulary as web LeaseStatusBadge. */}
        <View className="self-start rounded-md border border-neutral-300 bg-neutral-50 px-2 py-1">
          <Text className="text-[11px] font-bold uppercase tracking-wider text-neutral-700">
            {t(STATUS_KEY[lease.status])}
          </Text>
        </View>

        <View className="rounded-2xl border border-neutral-200 bg-white p-4">
          <Text
            className="text-lg font-semibold text-neutral-900"
            numberOfLines={2}
          >
            {lease.listing.title}
          </Text>
        </View>

        {/* Counterpart card */}
        <View className="rounded-2xl border border-neutral-200 bg-white p-4">
          <Text className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
            {viewerIsTenant
              ? t('lease.detail.parties.owner')
              : t('lease.detail.parties.tenant')}
          </Text>
          <Text className="mt-1 text-base font-semibold text-neutral-900">
            {counterpart.name ?? counterpart.email.split('@')[0]}
          </Text>
          <Text className="text-sm text-neutral-500">{counterpart.email}</Text>
        </View>

        {/* Terms grid */}
        <View className="rounded-2xl border border-neutral-200 bg-white p-4">
          <Row
            label={t('lease.detail.terms.startDate')}
            value={formatStartDate(lease.startDate)}
          />
          <Row
            label={t('lease.detail.terms.duration')}
            value={t('lease.detail.terms.months', {
              count: lease.durationMonths,
            })}
          />
          <Row
            label={t('lease.detail.terms.monthlyRent')}
            value={`${formatAriary(lease.monthlyRentMGA)} ${t('units.perMonth')}`}
            mono
          />
          <Row
            label={t('lease.detail.terms.caution')}
            value={
              lease.cautionMGA > 0
                ? `${formatAriary(lease.cautionMGA)} Ar`
                : '—'
            }
            mono
            last
          />
        </View>

        {/* Tenant actions — only when the viewer can actually act. */}
        {canTenantAct ? (
          !refuseOpen ? (
            <View className="gap-3">
              <Button
                title={t('lease.tenant.cta.accept')}
                disabled={pending}
                loading={signMutation.isPending}
                onPress={() => signMutation.mutate()}
              />
              <Button
                title={t('lease.tenant.cta.refuse')}
                variant="secondary"
                disabled={pending}
                onPress={() => setRefuseOpen(true)}
              />
            </View>
          ) : (
            <View className="gap-3 rounded-2xl border border-neutral-200 bg-white p-4">
              <Text className="text-[13px] font-semibold text-neutral-900">
                {t('lease.tenant.refuse.reason.label')}
              </Text>
              <TextInput
                value={reason}
                onChangeText={setReason}
                multiline
                maxLength={500}
                editable={!pending}
                placeholder={t('lease.tenant.refuse.reason.placeholder')}
                className="min-h-[88px] rounded-lg border border-neutral-200 px-3 py-2 text-[14px] text-neutral-900"
              />
              <Button
                title={t('lease.tenant.refuse.confirm')}
                variant="danger"
                disabled={pending}
                loading={refuseMutation.isPending}
                onPress={() => refuseMutation.mutate()}
              />
              <Button
                title={t('common.cancel')}
                variant="ghost"
                disabled={pending}
                onPress={() => setRefuseOpen(false)}
              />
            </View>
          )
        ) : null}

        {outcome === 'signed' ? (
          <View
            className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4"
            accessibilityLiveRegion="polite"
          >
            <Text className="text-[14px] font-medium text-emerald-900">
              {t('lease.tenant.outcome.signed')}
            </Text>
          </View>
        ) : null}
        {outcome === 'refused' ? (
          <View
            className="rounded-2xl border border-rose-200 bg-rose-50 p-4"
            accessibilityLiveRegion="polite"
          >
            <Text className="text-[14px] font-medium text-rose-900">
              {t('lease.tenant.outcome.refused')}
            </Text>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  )
}

function Row({
  label,
  value,
  mono,
  last,
}: {
  label: string
  value: string
  mono?: boolean
  last?: boolean
}) {
  return (
    <View
      className={`flex-row items-center justify-between py-2 ${
        last ? '' : 'border-b border-neutral-100'
      }`}
    >
      <Text className="text-[12px] font-semibold uppercase tracking-wider text-neutral-500">
        {label}
      </Text>
      <Text
        className={`text-[14px] font-semibold text-neutral-900 ${
          mono ? 'font-mono' : ''
        }`}
      >
        {value}
      </Text>
    </View>
  )
}
