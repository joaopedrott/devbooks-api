-- CreateTable
CREATE TABLE "ReadingHistory" (
    "id" SERIAL NOT NULL,
    "myBookId" INTEGER NOT NULL,
    "pageCount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReadingHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ReadingHistory_myBookId_idx" ON "ReadingHistory" USING HASH ("myBookId");

-- AddForeignKey
ALTER TABLE "ReadingHistory" ADD CONSTRAINT "ReadingHistory_myBookId_fkey" FOREIGN KEY ("myBookId") REFERENCES "MyBooks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
