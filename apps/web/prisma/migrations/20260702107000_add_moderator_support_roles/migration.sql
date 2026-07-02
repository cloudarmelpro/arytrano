-- ADM-06 — permission tiers below ADMIN.

ALTER TYPE "UserRole" ADD VALUE 'MODERATOR';
ALTER TYPE "UserRole" ADD VALUE 'SUPPORT';
