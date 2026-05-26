import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import type { LeaseRow } from '@arytrano/shared'
import { listMyLeases } from '@/lib/api/client'
import { useAuth } from '@/lib/auth/use-auth'
import { useT } from '@/lib/i18n/use-locale'
import type { MessageKey } from '@/lib/i18n/messages'

/**
 * Leases inbox (E-T22 mobile).
 *
 * Lists every lease where the signed-in user is owner OR tenant, freshest
 * first. The pivotal action — tenant accept/refuse — lives on the detail
 * screen `[id].tsx`. This screen is just a list with a status badge so the
 * tenant can spot PENDING entries that need their attention.
 */

const STATUS_KEY = {
  DRAFT: 'lease.status.DRAFT',
  PENDING_TENANT: 'lease.status.PENDING_TENANT',
  ACTIVE: 'lease.status.ACTIVE',
  REFUSED: 'lease.status.REFUSED',
  TERMINATED: 'lease.status.TERMINATED',
  DISPUTED: 'lease.status.DISPUTED',
} as const satisfies Record<LeaseRow['status'], MessageKey>

const STATUS_TONE: Record<LeaseRow['status'], { bg: string; fg: string }> = {
  DRAFT: { bg: 'bg-neutral-100', fg: 'text-neutral-600' },
  PENDING_TENANT: { bg: 'bg-amber-50', fg: 'text-amber-800' },
  ACTIVE: { bg: 'bg-emerald-50', fg: 'text-emerald-700' },
  REFUSED: { bg: 'bg-rose-50', fg: 'text-rose-700' },
  TERMINATED: { bg: 'bg-neutral-100', fg: 'text-neutral-500' },
  DISPUTED: { bg: 'bg-rose-50', fg: 'text-rose-700' },
}

function formatAriary(n: number): string {
  // Narrow no-break space matches the web (memory feedback_intl_frfr_separator)
  return new Intl.NumberFormat('fr-FR').format(n)
}

export default function LeasesInbox() {
  const { user, signedIn, isLoading: authLoading } = useAuth()
  const t = useT()
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    if (!authLoading && !signedIn) router.replace('/sign-in')
  }, [authLoading, signedIn])

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['leases', 'mine'],
    queryFn: listMyLeases,
    enabled: signedIn,
  })

  async function onRefresh() {
    setRefreshing(true)
    try {
      await refetch()
    } finally {
      setRefreshing(false)
    }
  }

  const userId = user?.id

  if (authLoading || (isLoading && !data)) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="border-b border-neutral-200 px-5 py-4">
        <Pressable onPress={() => router.back()}>
          <Text className="text-[13px] font-medium text-neutral-500">
            {t('common.back')}
          </Text>
        </Pressable>
        <Text className="mt-3 text-2xl font-bold text-neutral-900">
          {t('lease.list.title')}
        </Text>
      </View>

      {error ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-base text-rose-600">
            {t('lease.tenant.error.generic')}
          </Text>
        </View>
      ) : !data || data.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-base font-medium text-neutral-900">
            {t('lease.list.empty.title')}
          </Text>
          <Text className="mt-2 max-w-xs text-center text-sm text-neutral-500">
            {t('lease.list.empty.lead')}
          </Text>
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(l) => l.id}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
            />
          }
          contentContainerStyle={{ padding: 16 }}
          ItemSeparatorComponent={() => <View className="h-3" />}
          renderItem={({ item }) => {
            const role: 'owner' | 'tenant' =
              item.owner.id === userId ? 'owner' : 'tenant'
            const counterpart =
              role === 'owner' ? item.tenant : item.owner
            const counterpartName =
              counterpart.name ??
              (role === 'owner'
                ? t('lease.list.role.tenant')
                : t('lease.list.role.owner'))
            const tone = STATUS_TONE[item.status]
            return (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('lease.list.row.openCta')}
                onPress={() =>
                  router.push(`/leases/${item.id}` as never)
                }
                className="rounded-2xl border border-neutral-200 bg-white p-4"
              >
                <View className="flex-row items-center gap-2">
                  <Text className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                    {role === 'owner'
                      ? t('lease.list.role.owner')
                      : t('lease.list.role.tenant')}
                  </Text>
                  <View
                    className={`rounded-md border border-current/30 px-2 py-0.5 ${tone.bg}`}
                  >
                    <Text
                      className={`text-[10px] font-bold uppercase tracking-wider ${tone.fg}`}
                    >
                      {t(STATUS_KEY[item.status])}
                    </Text>
                  </View>
                </View>
                <Text
                  className="mt-2 text-base font-semibold text-neutral-900"
                  numberOfLines={1}
                >
                  {item.listing.title}
                </Text>
                <Text className="mt-1 text-sm text-neutral-500">
                  {counterpartName}
                </Text>
                <View className="mt-3 flex-row items-baseline justify-between">
                  <Text className="font-mono text-sm font-bold text-neutral-900">
                    {formatAriary(item.monthlyRentMGA)} {t('units.perMonth')}
                  </Text>
                  <Text className="text-[11px] text-neutral-400">
                    {t('lease.detail.terms.months', {
                      count: item.durationMonths,
                    })}
                  </Text>
                </View>
              </Pressable>
            )
          }}
        />
      )}
    </SafeAreaView>
  )
}
