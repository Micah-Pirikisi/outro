-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "document" TEXT;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'user';
