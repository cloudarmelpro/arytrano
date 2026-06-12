import 'server-only'
import { renderToBuffer } from '@react-pdf/renderer'
import {
  LeaseContractDocument,
  type LeaseContractInput,
} from './lease-contract'

/**
 * E-T27.1 — server-side render of the lease-contract React-PDF tree
 * into a binary Buffer suitable for Cloudinary upload.
 *
 * Wrapper exists so the call site (services/generate-lease-contract-
 * pdf.ts) doesn't pull react-pdf JSX imports — keeps the orchestrator
 * focused on side-effects.
 */
export async function renderLeaseContractPdf(
  input: LeaseContractInput,
): Promise<Buffer> {
  return renderToBuffer(LeaseContractDocument(input))
}
