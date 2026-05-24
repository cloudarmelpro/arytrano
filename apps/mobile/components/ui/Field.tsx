import { TextInput, View, Text, type TextInputProps } from 'react-native'

/**
 * Form field = label + input + optional error message. The label has
 * `accessibilityRole="text"` but it IS programmatically associated to
 * the input via `accessibilityLabel` (which RN's TextInput exposes as
 * the input's accessible name on both iOS and Android).
 */
export function Field({
  label,
  error,
  helperText,
  ...inputProps
}: TextInputProps & {
  label: string
  error?: string
  helperText?: string
}) {
  return (
    <View className="flex flex-col gap-1.5">
      <Text className="text-sm font-medium text-foreground">{label}</Text>
      <TextInput
        // A11y P2-1 : surface the error inside the input's own
        // accessible name so VoiceOver re-announces it when focus
        // returns to the field after a failed submit. The visible
        // <Text> below still renders for sighted users.
        accessibilityLabel={error ? `${label}. ${error}` : label}
        placeholderTextColor="#a1a1aa"
        className={`h-11 rounded-xl border bg-background px-3.5 text-base text-foreground ${
          error ? 'border-red-500' : 'border-border'
        }`}
        {...inputProps}
      />
      {error ? (
        <Text
          className="text-xs text-red-600"
          // A11y P0-3 : live region so screen readers announce the
          // error the moment it appears, without the user needing
          // to navigate to it. `polite` is the right register for
          // per-field validation — non-interrupting.
          accessibilityLiveRegion="polite"
          accessibilityRole="alert"
        >
          {error}
        </Text>
      ) : helperText ? (
        <Text className="text-xs text-muted-foreground">{helperText}</Text>
      ) : null}
    </View>
  )
}
