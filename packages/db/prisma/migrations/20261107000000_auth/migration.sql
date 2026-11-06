-- CreateEnum
CREATE TYPE "plan" AS ENUM ('FREE', 'PRO');

-- AlterTable
-- Existing rows get an empty name; the default is dropped right after
ALTER TABLE "users" ADD COLUMN     "name" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "plan" "plan" NOT NULL DEFAULT 'FREE';
ALTER TABLE "users" ALTER COLUMN "name" DROP DEFAULT;

-- AlterTable
ALTER TABLE "sessions" ADD COLUMN     "previous_token_hash" TEXT,
ADD COLUMN     "remember" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "rotated_at" TIMESTAMPTZ(3);

-- AlterTable
ALTER TABLE "admin_sessions" ADD COLUMN     "previous_token_hash" TEXT,
ADD COLUMN     "remember" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "rotated_at" TIMESTAMPTZ(3);

-- CreateTable
CREATE TABLE "password_reset_tokens" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMPTZ(3) NOT NULL,
    "used_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_tokens_token_hash_key" ON "password_reset_tokens"("token_hash");

-- CreateIndex
CREATE INDEX "password_reset_tokens_user_id_idx" ON "password_reset_tokens"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_refresh_token_hash_key" ON "sessions"("refresh_token_hash");

-- CreateIndex
CREATE INDEX "sessions_previous_token_hash_idx" ON "sessions"("previous_token_hash");

-- CreateIndex
CREATE UNIQUE INDEX "admin_sessions_refresh_token_hash_key" ON "admin_sessions"("refresh_token_hash");

-- CreateIndex
CREATE INDEX "admin_sessions_previous_token_hash_idx" ON "admin_sessions"("previous_token_hash");

-- AddForeignKey
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

