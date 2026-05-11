-- AlterTable
ALTER TABLE "StudyMaterial" ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'published';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "suspended" BOOLEAN NOT NULL DEFAULT false;
