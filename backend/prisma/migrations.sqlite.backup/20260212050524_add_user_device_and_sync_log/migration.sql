-- CreateTable
CREATE TABLE "UserDevice" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "device_id" TEXT NOT NULL,
    "device_name" TEXT,
    "device_type" TEXT,
    "platform" TEXT,
    "last_sync" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserDevice_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SyncLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "device_id" TEXT NOT NULL,
    "sync_type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "items_synced" INTEGER NOT NULL DEFAULT 0,
    "conflicts_found" INTEGER NOT NULL DEFAULT 0,
    "conflicts_resolved" INTEGER NOT NULL DEFAULT 0,
    "error_message" TEXT,
    "started_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" DATETIME
);

-- CreateIndex
CREATE INDEX "UserDevice_user_id_idx" ON "UserDevice"("user_id");

-- CreateIndex
CREATE INDEX "UserDevice_device_id_idx" ON "UserDevice"("device_id");

-- CreateIndex
CREATE UNIQUE INDEX "UserDevice_user_id_device_id_key" ON "UserDevice"("user_id", "device_id");

-- CreateIndex
CREATE INDEX "SyncLog_user_id_idx" ON "SyncLog"("user_id");

-- CreateIndex
CREATE INDEX "SyncLog_device_id_idx" ON "SyncLog"("device_id");

-- CreateIndex
CREATE INDEX "SyncLog_started_at_idx" ON "SyncLog"("started_at");
