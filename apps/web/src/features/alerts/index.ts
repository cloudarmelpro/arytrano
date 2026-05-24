/**
 * Public surface of the `alerts` feature.
 *
 * Client-safe: exports the footer form component. The Server Action
 * lives behind its own `'use server'` import; the client form bundles
 * it via the form's onSubmit handler.
 */
export { WhatsAppAlertForm } from './components/WhatsAppAlertForm'
