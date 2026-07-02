# Runbook — Postgres pgcrypto for sensitive PII (SEC-10)

> Encryption-at-rest for `User.phone` + partial email-domain
> redaction. Complements the existing SEC-C1 CIN encryption which
> already uses AES-256-GCM in-app.

**Owner** : Backend lead · **Status** : Design, not yet migrated.

## Why not encrypt everything in-app like CIN?

`User.phone` is queried by `hashPhone(phone) → phoneHash` on every
OTP request. That workflow needs plaintext at write time (to hash),
and plaintext-equivalent at read time (to send SMS). Encrypting
the column in-app means every read decrypts, killing indexed lookups.

pgcrypto's `pgp_sym_encrypt/decrypt` sits in-database, so the
Postgres row-level access control still governs who can decrypt.
Backups (SEC-11) carry ciphertext but the age-encrypted dump keeps
the double-key posture.

## Design

1. Enable extension : `CREATE EXTENSION IF NOT EXISTS pgcrypto;`
2. Add `phoneCiphertext BYTEA` alongside the existing `phone TEXT`
   column. Do NOT drop the plaintext yet.
3. Write path : on User.update({ phone }), also
   `pgp_sym_encrypt(phone, current_setting('app.pii_key'))` into
   phoneCiphertext.
4. Read path : the app keeps reading `phone` for now.
5. Migration cron : nightly, encrypt any row where phoneCiphertext IS NULL.
6. After 30 days of dual-write, cut the read path over via a view
   that returns `phone` from ciphertext when present.
7. After 60 days, drop the plaintext column.

## Session-level key handling

The `app.pii_key` GUC lets us rotate without touching every
statement. Set it once per connection:

```sql
SET app.pii_key = '${env.PII_ENCRYPTION_KEY}';
```

Wire this into the Prisma connection pool via
`beforeConnect` hook (Prisma 7 supports this).

## Threat model

- **Backup dump theft** : ciphertext + age wrapper. Attacker needs
  BOTH the age identity AND `app.pii_key`.
- **DB read compromise** : attacker gets the GUC via a
  `SHOW app.pii_key` — same threat as ANY in-DB decryption approach.
  Mitigated by role-based Postgres access + audit logs.
- **App VM compromise** : attacker gets `PII_ENCRYPTION_KEY` and can
  decrypt at will. Same posture as the CIN encryption today.

## Rollout ticket ownership

This runbook stays in "design" until we schedule the dual-write
migration. Ticket lives in TICKETS.md as SEC-10.

## Related runbooks

- `api-key-rotation.md` — how PII_ENCRYPTION_KEY rotates
- `restore-db.md` — backup / restore
- `gdpr-processors.md` — DPA obligations
