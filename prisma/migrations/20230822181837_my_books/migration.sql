-- CreateEnum
CREATE TYPE "BookState" AS ENUM ('IS_READING', 'READ', 'WANTS_TO_READ');

-- CreateTable
CREATE TABLE "MyBooks" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "bookId" TEXT NOT NULL,
    "bookState" "BookState" NOT NULL DEFAULT 'WANTS_TO_READ',
    "currentPage" INTEGER,
    "totalPages" INTEGER NOT NULL,
    "book" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MyBooks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MyBooks_userId_idx" ON "MyBooks" USING HASH ("userId");

-- CreateIndex
CREATE INDEX "MyBooks_bookId_idx" ON "MyBooks" USING HASH ("bookId");

-- AddForeignKey
ALTER TABLE "MyBooks" ADD CONSTRAINT "MyBooks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
