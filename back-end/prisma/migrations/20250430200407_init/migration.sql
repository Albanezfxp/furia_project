-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" CHAR(255) NOT NULL,
    "password" CHAR(255) NOT NULL,
    "email" CHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);
