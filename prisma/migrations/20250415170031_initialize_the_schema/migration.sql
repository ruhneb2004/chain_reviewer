-- CreateTable
CREATE TABLE "Assigner" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,

    CONSTRAINT "Assigner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Job" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "reward" INTEGER NOT NULL,
    "repoLink" TEXT NOT NULL,
    "newRepoLink" TEXT,
    "activeJob" BOOLEAN NOT NULL DEFAULT false,
    "assignerId" TEXT NOT NULL,
    "developerId" TEXT,

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Developer" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "jobsCompleted" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Developer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Assigner_email_key" ON "Assigner"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Developer_email_key" ON "Developer"("email");

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_assignerId_fkey" FOREIGN KEY ("assignerId") REFERENCES "Assigner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_developerId_fkey" FOREIGN KEY ("developerId") REFERENCES "Developer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
