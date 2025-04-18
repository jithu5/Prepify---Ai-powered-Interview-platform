-- AlterTable
ALTER TABLE "Interview_session" ALTER COLUMN "end_time" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Question" ALTER COLUMN "question" DROP NOT NULL,
ALTER COLUMN "answer" DROP NOT NULL,
ALTER COLUMN "response" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "dob" DROP NOT NULL;
