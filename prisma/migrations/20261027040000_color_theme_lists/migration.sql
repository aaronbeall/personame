-- Keep existing solid hex values unchanged and allow ordered lists for themes.
BEGIN;
ALTER TABLE "Persona" DROP CONSTRAINT "Persona_color_hex_check";
ALTER TABLE "Persona" ADD CONSTRAINT "Persona_color_values_check" CHECK (color IS NULL OR color ~ '^#[0-9a-f]{6}(,#[0-9a-f]{6})*$');
ALTER TABLE "Dimension" DROP CONSTRAINT "Dimension_color_hex_check";
ALTER TABLE "Dimension" ADD CONSTRAINT "Dimension_color_values_check" CHECK (color IS NULL OR color ~ '^#[0-9a-f]{6}(,#[0-9a-f]{6})*$');
ALTER TABLE "Archetype" DROP CONSTRAINT "Archetype_color_hex_check";
ALTER TABLE "Archetype" ADD CONSTRAINT "Archetype_color_values_check" CHECK (color IS NULL OR color ~ '^#[0-9a-f]{6}(,#[0-9a-f]{6})*$');
ALTER TABLE "QuizPage" DROP CONSTRAINT "QuizPage_color_hex_check";
ALTER TABLE "QuizPage" ADD CONSTRAINT "QuizPage_color_values_check" CHECK (color IS NULL OR color ~ '^#[0-9a-f]{6}(,#[0-9a-f]{6})*$');
ALTER TABLE "Question" DROP CONSTRAINT "Question_color_hex_check";
ALTER TABLE "Question" ADD CONSTRAINT "Question_color_values_check" CHECK (color IS NULL OR color ~ '^#[0-9a-f]{6}(,#[0-9a-f]{6})*$');
ALTER TABLE "Answer" DROP CONSTRAINT "Answer_color_hex_check";
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_color_values_check" CHECK (color IS NULL OR color ~ '^#[0-9a-f]{6}(,#[0-9a-f]{6})*$');
COMMIT;
