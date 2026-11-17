-- CreateTable
CREATE TABLE "AdminAuth" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "passwordHash" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminAuth_pkey" PRIMARY KEY ("id")
);
