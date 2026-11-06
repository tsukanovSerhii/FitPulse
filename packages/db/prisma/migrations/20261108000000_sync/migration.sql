-- CreateTable
CREATE TABLE "sync_records" (
    "user_id" UUID NOT NULL,
    "kind" TEXT NOT NULL,
    "record_id" TEXT NOT NULL,
    "data" JSONB,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "deleted_at" TIMESTAMPTZ(3),
    "seq" BIGSERIAL NOT NULL,

    CONSTRAINT "sync_records_pkey" PRIMARY KEY ("user_id","kind","record_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "sync_records_seq_key" ON "sync_records"("seq");

-- CreateIndex
CREATE INDEX "sync_records_user_id_seq_idx" ON "sync_records"("user_id", "seq");

-- AddForeignKey
ALTER TABLE "sync_records" ADD CONSTRAINT "sync_records_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

