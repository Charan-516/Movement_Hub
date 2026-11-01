-- AlterTable
ALTER TABLE "VolunteerSignup" ADD COLUMN     "email" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'confirmed';
