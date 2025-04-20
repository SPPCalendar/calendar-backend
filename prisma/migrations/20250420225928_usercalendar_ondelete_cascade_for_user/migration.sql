-- DropForeignKey
ALTER TABLE "UserCalendar" DROP CONSTRAINT "UserCalendar_user_id_fkey";

-- AddForeignKey
ALTER TABLE "UserCalendar" ADD CONSTRAINT "UserCalendar_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
