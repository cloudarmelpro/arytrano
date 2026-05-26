'use client'

import { Slider as SliderPrimitive } from '@base-ui/react/slider'

import { cn } from '@/lib/utils'

type RootProps<Value extends number | readonly number[]> =
  SliderPrimitive.Root.Props<Value> & {
    className?: string
  }

function SliderRoot<Value extends number | readonly number[]>({
  className,
  ...props
}: RootProps<Value>) {
  return (
    <SliderPrimitive.Root
      data-slot="slider"
      className={cn('relative flex w-full touch-none select-none flex-col gap-2', className)}
      {...props}
    />
  )
}

function SliderControl({
  className,
  ...props
}: SliderPrimitive.Control.Props) {
  return (
    <SliderPrimitive.Control
      data-slot="slider-control"
      className={cn('relative flex h-5 w-full items-center', className)}
      {...props}
    />
  )
}

function SliderTrack({
  className,
  ...props
}: SliderPrimitive.Track.Props) {
  return (
    <SliderPrimitive.Track
      data-slot="slider-track"
      className={cn(
        'relative h-1.5 w-full grow overflow-hidden rounded-full bg-muted',
        className,
      )}
      {...props}
    />
  )
}

function SliderIndicator({
  className,
  ...props
}: SliderPrimitive.Indicator.Props) {
  return (
    <SliderPrimitive.Indicator
      data-slot="slider-indicator"
      className={cn('absolute h-full rounded-full bg-primary', className)}
      {...props}
    />
  )
}

function SliderThumb({
  className,
  ...props
}: SliderPrimitive.Thumb.Props) {
  return (
    <SliderPrimitive.Thumb
      data-slot="slider-thumb"
      className={cn(
        'block size-5 shrink-0 rounded-full border-2 border-primary bg-background shadow-sm outline-none transition focus-visible:ring-4 focus-visible:ring-primary/25 data-dragging:scale-110 data-dragging:cursor-grabbing data-disabled:cursor-not-allowed data-disabled:opacity-50',
        className,
      )}
      {...props}
    />
  )
}

function SliderValue({
  className,
  ...props
}: SliderPrimitive.Value.Props) {
  return (
    <SliderPrimitive.Value
      data-slot="slider-value"
      className={cn('text-sm font-medium tabular-nums', className)}
      {...props}
    />
  )
}

export const Slider = {
  Root: SliderRoot,
  Control: SliderControl,
  Track: SliderTrack,
  Indicator: SliderIndicator,
  Thumb: SliderThumb,
  Value: SliderValue,
}
