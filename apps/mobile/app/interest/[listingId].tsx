import { useEffect, useState } from 'react'
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Switch,
  Text,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, useLocalSearchParams } from 'expo-router'
import { useMutation } from '@tanstack/react-query'
import {
  type CreateInterestLeadBody,
  createInterestLeadBodySchema,
  type MoveInWindow,
} from '@arytrano/shared'
import {
  ApiError,
  createInterestLead,
  requestPhoneOtp,
  verifyPhoneOtp,
} from '@/lib/api/client'
import { useT } from '@/lib/i18n/use-locale'
import { Button } from '@/components/ui/Button'
import { Field } from '@/components/ui/Field'

type Step = 'form' | 'otp' | 'success'

const MOVE_IN_OPTIONS: readonly MoveInWindow[] = [
  'IMMEDIATE',
  'WITHIN_2_WEEKS',
  'WITHIN_1_MONTH',
  'LATER',
]

/**
 * E-T28 mobile — concierge lead funnel.
 *
 * 3 steps :
 *  1. `form`    — name / phone / budget / move-in window / notes
 *  2. `otp`     — only entered if the server replied `otp_required`
 *                 on submit. Signed-in users skip this entirely.
 *  3. `success` — confirmation copy + back-to-listing button.
 *
 * Form values are kept LOCAL to this screen (no global state) — once
 * the user finishes, the lead row lives server-side and the next
 * touchpoint is the operator WhatsApp.
 */
export default function InterestLeadScreen() {
  const { listingId } = useLocalSearchParams<{ listingId: string }>()
  const t = useT()

  const [step, setStep] = useState<Step>('form')

  // Form state
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [budget, setBudget] = useState('')
  const [moveIn, setMoveIn] = useState<MoveInWindow>('WITHIN_2_WEEKS')
  const [notes, setNotes] = useState('')
  const [budgetConfirmed, setBudgetConfirmed] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  // OTP state
  const [otpCode, setOtpCode] = useState('')

  function buildBody(): CreateInterestLeadBody | null {
    const candidate = {
      listingId,
      tenantName: name,
      tenantPhone: phone,
      budgetMonthlyMGA: Number(budget.replace(/\s/g, '')) || 0,
      budgetConfirmed,
      moveInWindow: moveIn,
      notes: notes.trim() ? notes.trim() : null,
      source: 'PUBLIC_FORM' as const,
    }
    const parsed = createInterestLeadBodySchema.safeParse(candidate)
    if (!parsed.success) {
      const errs: Record<string, string> = {}
      for (const issue of parsed.error.issues) {
        const k = issue.path[0]?.toString() ?? '_form'
        errs[k] = issue.message
      }
      setFieldErrors(errs)
      return null
    }
    setFieldErrors({})
    return parsed.data
  }

  const submitMutation = useMutation({
    mutationFn: async (body: CreateInterestLeadBody) => createInterestLead(body),
    onSuccess: (res) => {
      if (res.kind === 'ok') setStep('success')
      else if (res.kind === 'otp_required') setStep('otp')
    },
    onError: (err) => {
      const msg =
        err instanceof ApiError && err.status === 429
          ? t('lead.error.rateLimited')
          : t('lead.error.generic')
      Alert.alert(t('lead.error.generic'), msg)
    },
  })

  const requestOtpMutation = useMutation({
    mutationFn: () => requestPhoneOtp({ phoneE164: phone }),
  })

  const verifyOtpMutation = useMutation({
    mutationFn: () => verifyPhoneOtp({ phoneE164: phone, code: otpCode }),
    onSuccess: () => {
      // Phone verified — resubmit the original body. The server will
      // now find the recent verification and skip the OTP gate.
      const body = buildBody()
      if (body) submitMutation.mutate(body)
    },
    onError: () => {
      Alert.alert(t('lead.error.generic'), t('lead.error.generic'))
    },
  })

  function onSubmitForm() {
    const body = buildBody()
    if (body) submitMutation.mutate(body)
  }

  // Trigger the first OTP send right when we land on the step.
  function onEnterOtpStep() {
    if (!requestOtpMutation.isPending) requestOtpMutation.mutate()
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          className="flex-1"
          contentContainerClassName="px-5 pb-10 pt-2"
          keyboardShouldPersistTaps="handled"
        >
          {step === 'form' ? (
            <FormStep
              name={name}
              setName={setName}
              phone={phone}
              setPhone={setPhone}
              budget={budget}
              setBudget={setBudget}
              moveIn={moveIn}
              setMoveIn={setMoveIn}
              notes={notes}
              setNotes={setNotes}
              budgetConfirmed={budgetConfirmed}
              setBudgetConfirmed={setBudgetConfirmed}
              fieldErrors={fieldErrors}
              onSubmit={onSubmitForm}
              isSubmitting={submitMutation.isPending}
              t={t}
            />
          ) : null}
          {step === 'otp' ? (
            <OtpStep
              phone={phone}
              code={otpCode}
              setCode={setOtpCode}
              onMount={onEnterOtpStep}
              onVerify={() => verifyOtpMutation.mutate()}
              onResend={() => requestOtpMutation.mutate()}
              isVerifying={
                verifyOtpMutation.isPending || submitMutation.isPending
              }
              isResending={requestOtpMutation.isPending}
              t={t}
            />
          ) : null}
          {step === 'success' ? (
            <SuccessStep
              onBack={() => router.replace(`/listing/${listingId}`)}
              t={t}
            />
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

function FormStep({
  name,
  setName,
  phone,
  setPhone,
  budget,
  setBudget,
  moveIn,
  setMoveIn,
  notes,
  setNotes,
  budgetConfirmed,
  setBudgetConfirmed,
  fieldErrors,
  onSubmit,
  isSubmitting,
  t,
}: {
  name: string
  setName: (v: string) => void
  phone: string
  setPhone: (v: string) => void
  budget: string
  setBudget: (v: string) => void
  moveIn: MoveInWindow
  setMoveIn: (v: MoveInWindow) => void
  notes: string
  setNotes: (v: string) => void
  budgetConfirmed: boolean
  setBudgetConfirmed: (v: boolean) => void
  fieldErrors: Record<string, string>
  onSubmit: () => void
  isSubmitting: boolean
  t: (k: Parameters<ReturnType<typeof useT>>[0]) => string
}) {
  return (
    <View className="flex flex-col gap-5">
      <View>
        <Text className="text-2xl font-bold text-foreground">
          {t('lead.form.title')}
        </Text>
        <Text className="mt-1 text-sm text-muted-foreground">
          {t('lead.form.subtitle')}
        </Text>
      </View>

      <Field
        label={t('lead.form.name')}
        value={name}
        onChangeText={setName}
        autoCapitalize="words"
        autoComplete="name"
        error={fieldErrors.tenantName}
      />

      <Field
        label={t('lead.form.phone')}
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        autoComplete="tel"
        placeholder="+261 34 12 34 567"
        helperText={t('lead.form.phone.help')}
        error={fieldErrors.tenantPhone}
      />

      <Field
        label={t('lead.form.budget')}
        value={budget}
        onChangeText={setBudget}
        keyboardType="numeric"
        placeholder="350000"
        error={fieldErrors.budgetMonthlyMGA}
      />

      <View className="flex flex-col gap-2">
        <Text className="text-sm font-medium text-foreground">
          {t('lead.form.moveIn')}
        </Text>
        <View className="flex flex-row flex-wrap gap-2">
          {MOVE_IN_OPTIONS.map((opt) => {
            const active = moveIn === opt
            return (
              <Pressable
                key={opt}
                onPress={() => setMoveIn(opt)}
                accessibilityRole="radio"
                accessibilityState={{ selected: active }}
                className={`rounded-full border px-3.5 py-2 ${
                  active
                    ? 'border-primary bg-primary'
                    : 'border-border bg-background'
                }`}
              >
                <Text
                  className={`text-sm font-medium ${
                    active ? 'text-primary-foreground' : 'text-foreground'
                  }`}
                >
                  {t(`lead.form.moveIn.${opt}` as const)}
                </Text>
              </Pressable>
            )
          })}
        </View>
      </View>

      <Field
        label={t('lead.form.notes')}
        value={notes}
        onChangeText={setNotes}
        multiline
        numberOfLines={3}
        textAlignVertical="top"
        style={{ minHeight: 88, paddingTop: 12 }}
      />

      <Pressable
        onPress={() => setBudgetConfirmed(!budgetConfirmed)}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: budgetConfirmed }}
        className="flex flex-row items-center gap-3"
      >
        <Switch
          value={budgetConfirmed}
          onValueChange={setBudgetConfirmed}
        />
        <Text className="flex-1 text-sm text-foreground">
          {t('lead.form.budgetConfirmed')}
        </Text>
      </Pressable>

      <Button
        title={
          isSubmitting ? t('lead.form.submitting') : t('lead.form.submit')
        }
        onPress={onSubmit}
        loading={isSubmitting}
      />
    </View>
  )
}

function OtpStep({
  phone,
  code,
  setCode,
  onMount,
  onVerify,
  onResend,
  isVerifying,
  isResending,
  t,
}: {
  phone: string
  code: string
  setCode: (v: string) => void
  onMount: () => void
  onVerify: () => void
  onResend: () => void
  isVerifying: boolean
  isResending: boolean
  t: (k: Parameters<ReturnType<typeof useT>>[0]) => string
}) {
  // Fire the first OTP send when this step mounts. `onMount` is a
  // stable callback from the parent that triggers requestPhoneOtp.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { onMount() }, [])

  return (
    <View className="flex flex-col gap-5">
      <View>
        <Text className="text-2xl font-bold text-foreground">
          {t('lead.otp.title')}
        </Text>
        <Text className="mt-1 text-sm text-muted-foreground">
          {t('lead.otp.subtitle')}
        </Text>
        <Text className="mt-2 font-mono text-base font-semibold text-foreground">
          {phone}
        </Text>
      </View>

      <Field
        label={t('lead.otp.code')}
        value={code}
        onChangeText={(v) => setCode(v.replace(/\D/g, '').slice(0, 6))}
        keyboardType="number-pad"
        autoComplete="sms-otp"
        textContentType="oneTimeCode"
        maxLength={6}
        placeholder="123456"
      />

      <Button
        title={t('lead.otp.verify')}
        onPress={onVerify}
        loading={isVerifying}
        disabled={code.length !== 6}
      />

      <Pressable
        onPress={onResend}
        disabled={isResending}
        accessibilityRole="button"
        className="items-center py-2"
      >
        <Text className="text-sm font-medium text-primary">
          {isResending ? t('lead.otp.resending') : t('lead.otp.resend')}
        </Text>
      </Pressable>
    </View>
  )
}

function SuccessStep({
  onBack,
  t,
}: {
  onBack: () => void
  t: (k: Parameters<ReturnType<typeof useT>>[0]) => string
}) {
  return (
    <View className="flex flex-col items-center gap-6 pt-12">
      <View className="h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
        <Text className="text-4xl">✓</Text>
      </View>
      <View className="items-center gap-2">
        <Text className="text-center text-2xl font-bold text-foreground">
          {t('lead.success.title')}
        </Text>
        <Text className="text-center text-sm text-muted-foreground">
          {t('lead.success.subtitle')}
        </Text>
      </View>
      <View className="w-full">
        <Button title={t('lead.success.back')} onPress={onBack} />
      </View>
    </View>
  )
}
