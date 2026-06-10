-- Add SUPER_ADMIN to UserRole enum
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'SUPER_ADMIN' BEFORE 'ADMIN';

-- Make companyId nullable on users table to support super admin (no company)
ALTER TABLE "users" ALTER COLUMN "companyId" DROP NOT NULL;
