BEGIN;
ALTER TABLE "Question" ADD COLUMN "dimensionInfluences" JSONB NOT NULL DEFAULT '{}';
-- Copy each old question influence onto every dimension the question measures.
UPDATE "Question" q SET "dimensionInfluences" = COALESCE((
  SELECT jsonb_object_agg(mapped."dimensionId", q.influence)
  FROM (SELECT DISTINCT w."dimensionId" FROM "AnswerWeight" w JOIN "Answer" a ON a.id = w."answerId"
        WHERE a."questionId" = q.id AND (q.type = 'MULTIPLE_CHOICE' OR a."order" < 2)) mapped
), '{}');
ALTER TABLE "Question" DROP COLUMN influence;
-- Existing saved results stay unchanged; expire in-progress authoring revisions.
UPDATE "Persona" SET "updatedAt" = NOW();
COMMIT;
