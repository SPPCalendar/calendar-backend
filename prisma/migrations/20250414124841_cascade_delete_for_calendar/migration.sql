-- DropForeignKey
ALTER TABLE "Event" DROP CONSTRAINT "Event_calendar_id_fkey";

-- DropForeignKey
ALTER TABLE "Event" DROP CONSTRAINT "Event_category_id_fkey";

-- DropForeignKey
ALTER TABLE "UserCalendar" DROP CONSTRAINT "UserCalendar_calendar_id_fkey";

-- AddForeignKey
ALTER TABLE "UserCalendar" ADD CONSTRAINT "UserCalendar_calendar_id_fkey" FOREIGN KEY ("calendar_id") REFERENCES "Calendar"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_calendar_id_fkey" FOREIGN KEY ("calendar_id") REFERENCES "Calendar"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;
