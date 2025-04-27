-- AlterTable
ALTER TABLE "Interview_session" ADD COLUMN     "max_count" INTEGER NOT NULL DEFAULT 10;

-- CreateTable
CREATE TABLE "Technology" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "interview_session_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Technology_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Technology_name_key" ON "Technology"("name");

-- AddForeignKey
ALTER TABLE "Technology" ADD CONSTRAINT "Technology_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Technology" ADD CONSTRAINT "Technology_interview_session_id_fkey" FOREIGN KEY ("interview_session_id") REFERENCES "Interview_session"("id") ON DELETE CASCADE ON UPDATE CASCADE;
