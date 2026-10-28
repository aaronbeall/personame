-- Rename in place so IDs, relationships, scores, and authored values survive.
BEGIN;
ALTER TYPE "MetricDisplayScale" RENAME TO "DimensionDisplayScale";
ALTER TABLE "Metric" RENAME TO "Dimension";
ALTER TABLE "ArchetypeMetric" RENAME TO "ArchetypeDimension";
ALTER TABLE "MetricScore" RENAME TO "DimensionScore";
ALTER TABLE "ArchetypeDimension" RENAME COLUMN "metricId" TO "dimensionId";
ALTER TABLE "AnswerWeight" RENAME COLUMN "metricId" TO "dimensionId";
ALTER TABLE "DimensionScore" RENAME COLUMN "metricName" TO "dimensionName";

ALTER TABLE "Dimension" RENAME CONSTRAINT "Metric_pkey" TO "Dimension_pkey";
ALTER TABLE "Dimension" RENAME CONSTRAINT "Metric_personaId_fkey" TO "Dimension_personaId_fkey";
ALTER TABLE "ArchetypeDimension" RENAME CONSTRAINT "ArchetypeMetric_pkey" TO "ArchetypeDimension_pkey";
ALTER TABLE "ArchetypeDimension" RENAME CONSTRAINT "ArchetypeMetric_archetypeId_fkey" TO "ArchetypeDimension_archetypeId_fkey";
ALTER TABLE "ArchetypeDimension" RENAME CONSTRAINT "ArchetypeMetric_metricId_fkey" TO "ArchetypeDimension_dimensionId_fkey";
ALTER TABLE "AnswerWeight" RENAME CONSTRAINT "AnswerWeight_metricId_fkey" TO "AnswerWeight_dimensionId_fkey";
ALTER TABLE "DimensionScore" RENAME CONSTRAINT "MetricScore_pkey" TO "DimensionScore_pkey";
ALTER TABLE "DimensionScore" RENAME CONSTRAINT "MetricScore_resultId_fkey" TO "DimensionScore_resultId_fkey";

ALTER INDEX "Metric_personaId_idx" RENAME TO "Dimension_personaId_idx";
ALTER INDEX "ArchetypeMetric_archetypeId_idx" RENAME TO "ArchetypeDimension_archetypeId_idx";
ALTER INDEX "ArchetypeMetric_metricId_idx" RENAME TO "ArchetypeDimension_dimensionId_idx";
ALTER INDEX "ArchetypeMetric_archetypeId_metricId_key" RENAME TO "ArchetypeDimension_archetypeId_dimensionId_key";
ALTER INDEX "AnswerWeight_metricId_idx" RENAME TO "AnswerWeight_dimensionId_idx";
ALTER INDEX "AnswerWeight_answerId_metricId_key" RENAME TO "AnswerWeight_answerId_dimensionId_key";
ALTER INDEX "MetricScore_resultId_idx" RENAME TO "DimensionScore_resultId_idx";

-- Rewrite only snapshot field names, preserving labels, scores, order, and extras.
UPDATE "QuizResult"
SET "snapshot" = jsonb_set("snapshot", '{scores}', (
  SELECT COALESCE(jsonb_agg(
    (entry - 'metricId' - 'metricName')
    || CASE WHEN entry ? 'metricId' THEN jsonb_build_object('dimensionId', entry->'metricId') ELSE '{}'::jsonb END
    || CASE WHEN entry ? 'metricName' THEN jsonb_build_object('dimensionName', entry->'metricName') ELSE '{}'::jsonb END
    ORDER BY ordinal
  ), '[]'::jsonb)
  FROM jsonb_array_elements("snapshot"->'scores') WITH ORDINALITY AS items(entry, ordinal)
))
WHERE jsonb_typeof("snapshot"->'scores') = 'array';
COMMIT;
