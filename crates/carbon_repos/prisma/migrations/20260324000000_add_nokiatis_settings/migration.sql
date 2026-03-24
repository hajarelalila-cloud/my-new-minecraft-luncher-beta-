-- Add Nokiatis-specific settings to AppConfiguration
-- This migration adds all the new columns for Nokiatis Launcher features

-- Add Nokiatis-specific columns to AppConfiguration
ALTER TABLE "AppConfiguration" ADD COLUMN "showNokiatisWelcome" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "AppConfiguration" ADD COLUMN "enableOfflineMode" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "AppConfiguration" ADD COLUMN "defaultTagFilter" TEXT;

-- Add Performance & Animation Settings
ALTER TABLE "AppConfiguration" ADD COLUMN "animationPerformance" TEXT NOT NULL DEFAULT 'medium';
ALTER TABLE "AppConfiguration" ADD COLUMN "enableTransitions" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "AppConfiguration" ADD COLUMN "enableParticles" BOOLEAN NOT NULL DEFAULT true;

-- Add Auto Backup Settings
ALTER TABLE "AppConfiguration" ADD COLUMN "autoBackupEnabled" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "AppConfiguration" ADD COLUMN "autoBackupInterval" INTEGER NOT NULL DEFAULT 7;
ALTER TABLE "AppConfiguration" ADD COLUMN "maxAutoBackups" INTEGER NOT NULL DEFAULT 5;

-- Add Notification Settings
ALTER TABLE "AppConfiguration" ADD COLUMN "notificationsEnabled" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "AppConfiguration" ADD COLUMN "notifyOnUpdates" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "AppConfiguration" ADD COLUMN "notifyOnFriendActivity" BOOLEAN NOT NULL DEFAULT true;

-- Create Instance Tags table
CREATE TABLE IF NOT EXISTS "InstanceTag" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#3b82f6'
);

CREATE UNIQUE INDEX IF NOT EXISTS "InstanceTag_name_key" ON "InstanceTag"("name");

-- Create Instance Backup table
CREATE TABLE IF NOT EXISTS "InstanceBackup" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "instanceId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "path" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    CONSTRAINT "InstanceBackup_instanceId_fkey" FOREIGN KEY ("instanceId") REFERENCES "Instance" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create Mod Profile table
CREATE TABLE IF NOT EXISTS "ModProfile" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "instanceId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ModProfile_instanceId_fkey" FOREIGN KEY ("instanceId") REFERENCES "Instance" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create Profile Mod Entry table
CREATE TABLE IF NOT EXISTS "ProfileModEntry" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "profileId" INTEGER NOT NULL,
    "modId" TEXT NOT NULL,
    "modName" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "ProfileModEntry_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "ModProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create Server Favorites table
CREATE TABLE IF NOT EXISTS "ServerFavorite" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "port" INTEGER NOT NULL DEFAULT 25565,
    "icon" TEXT,
    "description" TEXT,
    "lastPlayed" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastPing" INTEGER,
    "playerCount" INTEGER,
    "maxPlayers" INTEGER,
    "motd" TEXT,
    "online" BOOLEAN NOT NULL DEFAULT false,
    "lastChecked" DATETIME,
    "version" TEXT
);

-- Create Icon Packs table
CREATE TABLE IF NOT EXISTS "IconPack" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "author" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create Custom Icon table
CREATE TABLE IF NOT EXISTS "CustomIcon" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "iconPackId" TEXT,
    "name" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "tags" TEXT,
    "category" TEXT,
    CONSTRAINT "CustomIcon_iconPackId_fkey" FOREIGN KEY ("iconPackId") REFERENCES "IconPack" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create Crash Reports table
CREATE TABLE IF NOT EXISTS "CrashReport" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "instanceId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "summary" TEXT,
    "cause" TEXT,
    "solution" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isResolved" BOOLEAN NOT NULL DEFAULT false,
    "modId" TEXT,
    CONSTRAINT "CrashReport_instanceId_fkey" FOREIGN KEY ("instanceId") REFERENCES "Instance" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create Notifications table
CREATE TABLE IF NOT EXISTS "Notification" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "icon" TEXT,
    "actionUrl" TEXT,
    "actionLabel" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" DATETIME,
    "priority" INTEGER NOT NULL DEFAULT 0
);

-- Create Offline Skins table for offline/cracked accounts
CREATE TABLE IF NOT EXISTS "OfflineSkin" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL UNIQUE,
    "skinData" BLOB NOT NULL,
    "skinUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Add enhanced Instance columns (check if they exist first)
-- These are added via separate ALTER TABLE statements to handle existing columns gracefully

-- Add new columns to Instance if they don't exist
-- Note: SQLite doesn't support IF NOT EXISTS for ALTER TABLE ADD COLUMN
-- So we use a more robust approach by checking pragmas

-- Add customIconId to Instance
ALTER TABLE "Instance" ADD COLUMN "customIconId" TEXT;

-- Add gpuPreference to Instance
ALTER TABLE "Instance" ADD COLUMN "gpuPreference" TEXT;

-- Add customWidth to Instance
ALTER TABLE "Instance" ADD COLUMN "customWidth" INTEGER;

-- Add customHeight to Instance
ALTER TABLE "Instance" ADD COLUMN "customHeight" INTEGER;

-- Add playTime to Instance
ALTER TABLE "Instance" ADD COLUMN "playTime" INTEGER NOT NULL DEFAULT 0;

-- Add lastPlayed to Instance
ALTER TABLE "Instance" ADD COLUMN "lastPlayed" DATETIME;

-- Add notes to Instance
ALTER TABLE "Instance" ADD COLUMN "notes" TEXT;

-- Add iconPath to Instance
ALTER TABLE "Instance" ADD COLUMN "iconPath" TEXT;

-- Create World Data table
CREATE TABLE IF NOT EXISTS "WorldData" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "instanceId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "lastPlayed" DATETIME,
    "gameMode" TEXT,
    "difficulty" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "size" INTEGER,
    "isBackup" BOOLEAN NOT NULL DEFAULT false,
    "backupDate" DATETIME,
    "thumbnail" TEXT,
    CONSTRAINT "WorldData_instanceId_fkey" FOREIGN KEY ("instanceId") REFERENCES "Instance" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create Screenshot Data table
CREATE TABLE IF NOT EXISTS "ScreenshotData" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "instanceId" INTEGER NOT NULL,
    "filename" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "size" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isFavorite" BOOLEAN NOT NULL DEFAULT false,
    "worldName" TEXT,
    "tags" TEXT,
    CONSTRAINT "ScreenshotData_instanceId_fkey" FOREIGN KEY ("instanceId") REFERENCES "Instance" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Add color and icon to InstanceGroup if they don't exist
ALTER TABLE "InstanceGroup" ADD COLUMN "color" TEXT DEFAULT '#6b7280';
ALTER TABLE "InstanceGroup" ADD COLUMN "icon" TEXT;
