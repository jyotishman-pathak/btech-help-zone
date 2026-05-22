-- AlterTable
ALTER TABLE "MockTestAttempt" ADD COLUMN     "markedForReview" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "MockTestQuestion" ADD COLUMN     "explanation" TEXT,
ADD COLUMN     "explanationImageUrl" TEXT;
