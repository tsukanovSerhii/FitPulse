-- CreateIndex
CREATE INDEX "sync_records_kind_updated_at_idx" ON "sync_records"("kind", "updated_at");

-- CreateIndex
CREATE INDEX "sync_records_updated_at_idx" ON "sync_records"("updated_at");

