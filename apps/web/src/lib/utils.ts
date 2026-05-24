// Reserved for shadcn `cn()` only — do NOT add other helpers here.
// Per ARCHITECTURE.md rule #6 (no catch-all utils.ts), every other helper
// must live in a named module (e.g. lib/format/currency.ts, lib/auth/jwt.ts).
// `cn` is kept here only because shadcn components import from "@/lib/utils"
// by convention and re-routing them on each `shadcn add` is unsustainable.

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
