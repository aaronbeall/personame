CREATE INDEX "Persona_creatorId_updatedAt_id_idx" ON "Persona"("creatorId", "updatedAt", "id");
CREATE INDEX "Persona_status_visibility_publishedAt_id_idx" ON "Persona"("status", "visibility", "publishedAt", "id");
CREATE INDEX "QuizResult_userId_personaId_completedAt_id_idx" ON "QuizResult"("userId", "personaId", "completedAt" DESC, "id" DESC);
