ALTER TABLE "QuizPage" ADD COLUMN "presentation" JSONB NOT NULL DEFAULT '{}';
ALTER TABLE "QuizResult" ADD COLUMN "modelKey" TEXT;
ALTER TABLE "DimensionScore" ADD COLUMN "dimensionId" TEXT;
CREATE INDEX "QuizResult_personaId_modelKey_idx" ON "QuizResult"("personaId", "modelKey");
