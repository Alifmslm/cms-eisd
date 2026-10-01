-- AlterTable
ALTER TABLE "Achievement" DROP COLUMN "assistantCode",
DROP COLUMN "memberNames";

-- CreateTable
CREATE TABLE "AchievementMember" (
    "id" TEXT NOT NULL,
    "achievementId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "assistantCode" TEXT NOT NULL,

    CONSTRAINT "AchievementMember_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AchievementMember_assistantCode_key" ON "AchievementMember"("assistantCode");

-- CreateIndex
CREATE INDEX "AchievementMember_achievementId_idx" ON "AchievementMember"("achievementId");

-- AddForeignKey
ALTER TABLE "AchievementMember" ADD CONSTRAINT "AchievementMember_achievementId_fkey" FOREIGN KEY ("achievementId") REFERENCES "Achievement"("id") ON DELETE CASCADE ON UPDATE CASCADE;
