/*
  Warnings:

  - A unique constraint covering the columns `[profileId,organizationId,type]` on the table `Engagement` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Engagement_profileId_organizationId_key";

-- CreateIndex
CREATE UNIQUE INDEX "Engagement_profileId_organizationId_type_key" ON "Engagement"("profileId", "organizationId", "type");
