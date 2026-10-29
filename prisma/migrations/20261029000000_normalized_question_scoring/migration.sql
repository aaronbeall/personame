BEGIN;
-- Preserve historic result snapshots. Convert authored point contributions into
-- bounded answer positions and relative question influence for future results.
ALTER TABLE "Question" ADD COLUMN "influence" DOUBLE PRECISION NOT NULL DEFAULT 1;
CREATE TEMP TABLE scoring_magnitude ON COMMIT DROP AS
SELECT q.id, GREATEST(COALESCE(MAX(ABS(w.value)), 0), 1) AS magnitude
FROM "Question" q LEFT JOIN "Answer" a ON a."questionId" = q.id
LEFT JOIN "AnswerWeight" w ON w."answerId" = a.id
WHERE q.type = 'MULTIPLE_CHOICE' OR a."order" < 2
GROUP BY q.id;
-- Remove dimensions that were entirely zero (unrelated), and ignored scale-point weights.
DELETE FROM "AnswerWeight" w USING "Answer" a, "Question" q
WHERE w."answerId" = a.id AND a."questionId" = q.id AND
 ((q.type = 'SCALE' AND a."order" >= 2) OR NOT EXISTS (
  SELECT 1 FROM "AnswerWeight" w2 JOIN "Answer" a2 ON a2.id = w2."answerId"
  WHERE a2."questionId" = q.id AND w2."dimensionId" = w."dimensionId"
  AND (q.type = 'MULTIPLE_CHOICE' OR a2."order" < 2) AND w2.value <> 0
 ));
UPDATE "Question" q SET influence = m.magnitude FROM scoring_magnitude m WHERE q.id = m.id;
UPDATE "AnswerWeight" w SET value = 50 + 50 * w.value / m.magnitude
FROM "Answer" a, scoring_magnitude m WHERE w."answerId" = a.id AND a."questionId" = m.id;
-- Missing options in a mapped dimension previously contributed zero: now neutral 50.
INSERT INTO "AnswerWeight" (id,value,"answerId","dimensionId","createdAt","updatedAt")
SELECT md5(a.id || mapped."dimensionId" || 'normalized-v2'),50,a.id,mapped."dimensionId",NOW(),NOW()
FROM "Answer" a JOIN "Question" q ON q.id = a."questionId"
JOIN (SELECT DISTINCT a2."questionId",w."dimensionId" FROM "AnswerWeight" w JOIN "Answer" a2 ON a2.id=w."answerId") mapped ON mapped."questionId"=q.id
WHERE (q.type='MULTIPLE_CHOICE' OR a."order"<2)
AND NOT EXISTS (SELECT 1 FROM "AnswerWeight" w WHERE w."answerId"=a.id AND w."dimensionId"=mapped."dimensionId");
ALTER TABLE "Question" ADD CONSTRAINT "Question_influence_range" CHECK (influence > 0 AND influence <= 100);
ALTER TABLE "AnswerWeight" ADD CONSTRAINT "AnswerWeight_position_range" CHECK (value >= 0 AND value <= 100);
-- Expire cached public revisions and stale in-progress submissions after conversion.
UPDATE "Persona" SET "updatedAt" = NOW();

COMMIT;
