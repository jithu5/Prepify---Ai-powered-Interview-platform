/*
  Warnings:

  - You are about to drop the column `response` on the `Question` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Question" DROP COLUMN "response";

-- CreateTable
CREATE TABLE "Response" (
    "id" TEXT NOT NULL,
    "question_id" TEXT NOT NULL,
    "feedback" TEXT,
    "score" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Response_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Response_question_id_key" ON "Response"("question_id");

-- AddForeignKey
ALTER TABLE "Response" ADD CONSTRAINT "Response_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;
