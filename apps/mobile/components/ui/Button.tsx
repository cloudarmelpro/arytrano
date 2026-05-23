import {
  ActivityIndicator,
  Pressable,
  Text,
  type PressableProps,
} from 'react-native'

type Variant = 'primary' | 'outline' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

const VARIANT_STYLES: Record<Variant, { container: string; text: string }> = {
  primary: {
    container: 'bg-primary active:opacity-90',
    text: 'text-primary-foreground',
  },
  outline: {
    container: 'border border-border bg-background active:bg-muted',
    text: 'text-foreground',
  },
  ghost: {
    container: 'bg-transparent active:bg-muted',
    text: 'text-primary',
  },
}

const SIZE_STYLES: Record<Size, { container: string; text: string }> = {
  sm: { container: 'h-9 px-3', text: 'text-sm' },
  md: { container: 'h-11 px-5', text: 'text-base' },
  lg: { container: 'h-12 px-6', text: 'text-base' },
}

/**
 * Branded button — same component for primary CTAs, outlined secondary
 * actions, and ghost links. Wraps a `Pressable` so the active-state
 * background appears on touch (not just on release). The label is
 * passed via `title` to keep the call site terse.
 *
 * Loading state shows a spinner instead of the label and disables the
 * underlying Pressable so a double-tap can't fire the action twice.
 */
export function Button({
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  ...rest
}: Omit<PressableProps, 'children'> & {
  title: string
  variant?: Variant
  size?: Size
  loading?: boolean
}) {
  const v = VARIANT_STYLES[variant]
  const s = SIZE_STYLES[size]
  return (
    <Pressable
      {...rest}
      disabled={loading || disabled}
      className={`flex-row items-center justify-center rounded-xl ${v.container} ${s.container} ${
        loading || disabled ? 'opacity-50' : ''
      }`}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? '#ffffff' : '#191970'}
        />
      ) : (
        <Text className={`font-semibold ${v.text} ${s.text}`}>{title}</Text>
      )}
    </Pressable>
  )
}
