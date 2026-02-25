-- CreateTable
CREATE TABLE "DataCenterRun" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "state_json" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_played_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DataCenterRun_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DataCenterRun_user_id_idx" ON "DataCenterRun"("user_id");

-- CreateIndex
CREATE INDEX "DataCenterRun_user_id_status_idx" ON "DataCenterRun"("user_id", "status");

-- CreateIndex
CREATE INDEX "DataCenterRun_last_played_at_idx" ON "DataCenterRun"("last_played_at");

-- AddForeignKey
ALTER TABLE "DataCenterRun" ADD CONSTRAINT "DataCenterRun_user_id_fkey"
FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
