-- AlterTable
ALTER TABLE "AdminUser" ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'event_admin';

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "createdByAdminId" INTEGER;

-- CreateTable
CREATE TABLE "EventAdminAssignment" (
    "id" SERIAL NOT NULL,
    "eventId" INTEGER NOT NULL,
    "adminId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventAdminAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EventAdminAssignment_eventId_adminId_key" ON "EventAdminAssignment"("eventId", "adminId");

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_createdByAdminId_fkey" FOREIGN KEY ("createdByAdminId") REFERENCES "AdminUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventAdminAssignment" ADD CONSTRAINT "EventAdminAssignment_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventAdminAssignment" ADD CONSTRAINT "EventAdminAssignment_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "AdminUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
