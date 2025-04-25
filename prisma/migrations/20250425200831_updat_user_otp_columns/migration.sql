-- AlterTable
ALTER TABLE "User" ADD COLUMN     "forgot_password_otp" INTEGER,
ADD COLUMN     "forgot_password_otp_expiry" TIMESTAMP(3),
ADD COLUMN     "is_account_verified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "verify_otp" INTEGER,
ADD COLUMN     "verify_otp_expiry" TIMESTAMP(3);
