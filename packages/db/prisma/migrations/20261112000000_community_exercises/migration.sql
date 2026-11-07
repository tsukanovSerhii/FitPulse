-- CreateEnum
CREATE TYPE "submission_status" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "community_exercises" (
    "id" UUID NOT NULL,
    "author_id" UUID NOT NULL,
    "audience" TEXT NOT NULL DEFAULT 'public',
    "status" "submission_status" NOT NULL DEFAULT 'PENDING',
    "data" JSONB NOT NULL,
    "reject_reason" TEXT,
    "reviewed_by" UUID,
    "reviewed_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "community_exercises_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "community_exercises_status_created_at_idx" ON "community_exercises"("status", "created_at");

-- CreateIndex
CREATE INDEX "community_exercises_author_id_created_at_idx" ON "community_exercises"("author_id", "created_at");

-- AddForeignKey
ALTER TABLE "community_exercises" ADD CONSTRAINT "community_exercises_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "community_exercises" ADD CONSTRAINT "community_exercises_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "admin_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
