import 'server-only'

export interface InitiateDepositInput {
  idempotencyKey: string
  amountMGA: string
  description: string
  payerPhone: string
  metadata?: Record<string, string>
}

export interface InitiateDepositResult {
  providerTxId: string
  status: 'pending' | 'confirmed' | 'failed'
  raw: unknown
}

export interface Transaction {
  providerTxId: string
  status: 'pending' | 'confirmed' | 'failed' | 'refunded'
  amountMGA: string
  raw: unknown
}

export interface WebhookEvent {
  providerTxId: string
  status: Transaction['status']
  occurredAt: Date
  raw: unknown
}

export interface PaymentProvider {
  initiateDeposit(input: InitiateDepositInput): Promise<InitiateDepositResult>
  getTransaction(providerTxId: string): Promise<Transaction>
  verifyWebhook(rawBody: string, headers: Headers): Promise<WebhookEvent>
}
