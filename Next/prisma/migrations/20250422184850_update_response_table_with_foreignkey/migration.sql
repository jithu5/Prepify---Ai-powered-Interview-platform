/*
  Warnings:

  - Added the required column `interview_session_id` to the `Response` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Response" ADD COLUMN     "interview_session_id" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Response" ADD CONSTRAINT "Response_interview_session_id_fkey" FOREIGN KEY ("interview_session_id") REFERENCES "Interview_session"("id") ON DELETE CASCADE ON UPDATE CASCADE;
