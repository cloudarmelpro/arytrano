'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CANONICAL_ROOMS } from '../schemas'
import { InventoryRoomCard } from './InventoryRoomCard'

type ExistingItem = {
  id: string
  phase: 'ENTRY' | 'EXIT'
  roomKey: string
  notes: string | null
  photoUrls: string[]
  uploadedBy: { id: string; name: string | null } | null
  updatedAt: Date
}

/**
 * E-T27.2 — one column per phase (ENTRY or EXIT).
 *
 * Seeds the room list with the canonical 9 rooms ; extra custom
 * rooms typed by the visitor are appended below. Any existing
 * InventoryItem row is mapped onto its room card so the visitor
 * sees the current photos + notes.
 */
const ROOM_LABELS: Record<string, string> = {
  SALON: 'Salon',
  CUISINE: 'Cuisine',
  CHAMBRE_1: 'Chambre 1',
  CHAMBRE_2: 'Chambre 2',
  CHAMBRE_3: 'Chambre 3',
  SALLE_DE_BAIN: 'Salle de bain',
  WC: 'WC',
  BALCON: 'Balcon',
  ENTREE: 'Entrée',
}

function labelFor(roomKey: string): string {
  if (ROOM_LABELS[roomKey]) return ROOM_LABELS[roomKey]
  // Custom rooms : prettify the SCREAMING_SNAKE.
  return roomKey
    .split('_')
    .map((s) => s.charAt(0) + s.slice(1).toLowerCase())
    .join(' ')
}

export function InventoryPhaseColumn({
  leaseId,
  phase,
  title,
  items,
  disabled,
}: {
  leaseId: string
  phase: 'ENTRY' | 'EXIT'
  title: string
  items: ExistingItem[]
  disabled: boolean
}) {
  const [customRooms, setCustomRooms] = useState<string[]>([])
  const [draftCustom, setDraftCustom] = useState('')

  const existingMap = new Map(items.map((i) => [i.roomKey, i]))
  // Merge canonical + custom + any existing-only rooms not in canonical.
  const seenRooms = new Set<string>([
    ...CANONICAL_ROOMS,
    ...customRooms,
    ...items.map((i) => i.roomKey),
  ])
  const rooms = Array.from(seenRooms)

  function addCustomRoom() {
    const trimmed = draftCustom.trim().toUpperCase().replace(/\s+/g, '_')
    if (!/^[A-Z][A-Z0-9_]*$/.test(trimmed) || trimmed.length < 2) {
      return
    }
    if (rooms.includes(trimmed)) {
      setDraftCustom('')
      return
    }
    setCustomRooms((p) => [...p, trimmed])
    setDraftCustom('')
  }

  return (
    <section className="flex flex-col gap-4">
      <header className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-serif text-[clamp(20px,2vw,26px)] font-normal leading-tight">
          {title}
        </h2>
      </header>

      <div className="flex flex-col gap-3">
        {rooms.map((roomKey) => (
          <InventoryRoomCard
            key={`${phase}-${roomKey}`}
            leaseId={leaseId}
            phase={phase}
            roomKey={roomKey}
            roomLabel={labelFor(roomKey)}
            existing={existingMap.get(roomKey) ?? null}
            disabled={disabled}
          />
        ))}
      </div>

      {!disabled ? (
        <div className="flex flex-wrap items-center gap-2 rounded-md border border-dashed border-border bg-muted/20 p-3 text-[13px]">
          <span className="text-foreground/70">+ Ajouter une pièce :</span>
          <Input
            value={draftCustom}
            onChange={(e) => setDraftCustom(e.target.value)}
            placeholder="GARAGE, ATELIER, …"
            className="h-9 max-w-[180px]"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addCustomRoom}
          >
            Ajouter
          </Button>
        </div>
      ) : null}
    </section>
  )
}
