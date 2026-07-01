'use client'

import { useEffect, useState, useCallback } from 'react'

/**
 * TEN-01 — small localStorage-backed store for the side-by-side
 * comparator (up to 3 listings). Public API is stable so both the
 * "Add" button on cards and the sticky banner read/write through the
 * same hook.
 *
 * We broadcast changes across tabs via the `storage` event so a user
 * adding a listing from one tab sees the count update on another.
 */
const STORAGE_KEY = 'arytrano-compare-v1'
export const COMPARE_MAX = 3
const CHANGE_EVENT = 'arytrano-compare-changed'

function read(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter((v): v is string => typeof v === 'string').slice(0, COMPARE_MAX)
  } catch {
    return []
  }
}

function write(ids: string[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
    window.dispatchEvent(new CustomEvent(CHANGE_EVENT))
  } catch {
    /* ignore */
  }
}

export function useCompareStore() {
  const [ids, setIds] = useState<string[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setIds(read())
    const refresh = () => setIds(read())
    window.addEventListener('storage', refresh)
    window.addEventListener(CHANGE_EVENT, refresh)
    return () => {
      window.removeEventListener('storage', refresh)
      window.removeEventListener(CHANGE_EVENT, refresh)
    }
  }, [])

  const toggle = useCallback((id: string) => {
    const next = read()
    const idx = next.indexOf(id)
    if (idx >= 0) {
      next.splice(idx, 1)
    } else if (next.length < COMPARE_MAX) {
      next.push(id)
    } else {
      return { added: false, full: true }
    }
    write(next)
    setIds(next)
    return { added: idx < 0, full: false }
  }, [])

  const remove = useCallback((id: string) => {
    const next = read().filter((v) => v !== id)
    write(next)
    setIds(next)
  }, [])

  const clear = useCallback(() => {
    write([])
    setIds([])
  }, [])

  return { ids, mounted, toggle, remove, clear }
}
