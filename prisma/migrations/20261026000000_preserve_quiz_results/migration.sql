ALTER TABLE "QuizResult" ADD COLUMN "snapshot" JSONB;
ALTER TABLE "QuizResult" DROP CONSTRAINT "QuizResult_archetypeId_fkey";
ALTER TABLE "QuizResult" ALTER COLUMN "archetypeId" DROP NOT NULL;
ALTER TABLE "QuizResult" ADD CONSTRAINT "QuizResult_archetypeId_fkey" FOREIGN KEY ("archetypeId") REFERENCES "Archetype"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "UserAnswer" DROP CONSTRAINT "UserAnswer_answerId_fkey";
ALTER TABLE "UserAnswer" ALTER COLUMN "answerId" DROP NOT NULL;
ALTER TABLE "UserAnswer" ADD CONSTRAINT "UserAnswer_answerId_fkey" FOREIGN KEY ("answerId") REFERENCES "Answer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "QuizResult" ADD COLUMN "submissionKey" TEXT;
CREATE UNIQUE INDEX "QuizResult_submissionKey_key" ON "QuizResult"("submissionKey");
