-- CreateTable
CREATE TABLE "Achievement" (
    "id" TEXT NOT NULL,
    "memberNames" TEXT[],
    "assistantCode" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "customCategory" TEXT,
    "level" TEXT NOT NULL,
    "result" TEXT NOT NULL,
    "competitionName" TEXT NOT NULL,
    "competitionYearMonth" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Achievement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Achievement_category_idx" ON "Achievement"("category");

-- CreateIndex
CREATE INDEX "Achievement_level_idx" ON "Achievement"("level");

-- CreateIndex
CREATE INDEX "Achievement_result_idx" ON "Achievement"("result");

-- CreateIndex
CREATE INDEX "Achievement_competitionYearMonth_idx" ON "Achievement"("competitionYearMonth");
