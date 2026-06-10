-- Add SUPER_ADMIN to UserRole enum
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'SUPER_ADMIN' BEFORE 'ADMIN';

-- Create a system company for super admins (if it doesn't exist)
INSERT INTO "companies" ("id", "name", "slug", "createdAt", "updatedAt")
VALUES ('system-company-id', 'Sistema TaskFlow', 'system', NOW(), NOW())
ON CONFLICT ("slug") DO NOTHING;
