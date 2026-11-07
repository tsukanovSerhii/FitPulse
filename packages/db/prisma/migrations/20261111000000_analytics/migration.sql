-- AlterTable
ALTER TABLE "sessions" ADD COLUMN     "app_mode" TEXT,
ADD COLUMN     "browser" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "country" TEXT,
ADD COLUMN     "device_type" TEXT,
ADD COLUMN     "ip_prefix" TEXT,
ADD COLUMN     "last_seen_at" TIMESTAMPTZ(3),
ADD COLUMN     "os" TEXT;

-- CreateTable
CREATE TABLE "user_activity" (
    "user_id" UUID NOT NULL,
    "day" DATE NOT NULL,
    "minutes" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "user_activity_pkey" PRIMARY KEY ("user_id","day")
);

-- CreateIndex
CREATE INDEX "user_activity_day_idx" ON "user_activity"("day");

-- CreateIndex
CREATE INDEX "sessions_created_at_idx" ON "sessions"("created_at");

-- AddForeignKey
ALTER TABLE "user_activity" ADD CONSTRAINT "user_activity_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

