import { app, BrowserWindow, ipcMain } from "electron";
import * as path from "path";
import { NotificationService } from "./services/notificationService";
import { WindowManager } from "./services/windowManager";
import { NotificationConfig } from "./types";
import { ConfigService } from "./services/configService";
import { DatabaseConfigService } from "./services/databaseConfigService";
import { DatabaseConfigWindow } from "./services/databaseConfigWindow";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Initialize services
let configService: ConfigService;
let notificationService: NotificationService;
let windowManager: WindowManager;
let databaseConfigService: DatabaseConfigService;
let databaseConfigWindow: DatabaseConfigWindow;

async function initializeServices(databaseUrl: string) {
  try {
    // Initialize remaining services with database configuration
    const dbConfig = {
      connectionString: databaseUrl,
    };

    // Close existing services if they exist
    if (configService) {
      await configService.close();
    }
    if (notificationService) {
      notificationService.stopAllNotifications();
    }

    // Initialize new services
    configService = await ConfigService.getInstance(dbConfig);
    notificationService = NotificationService.getInstance();

    // Initialize notifications from saved config
    const config = await configService.getConfig();
    config.notifications.forEach((notification: NotificationConfig) => {
      if (notification.is_enabled) {
        notificationService.startNotification(notification);
      }
    });

    return true;
  } catch (error) {
    console.error("Failed to initialize database connection:", error);
    return false;
  }
}

// Initialize app
app.whenReady().then(async () => {
  // Initialize services
  databaseConfigService = DatabaseConfigService.getInstance();
  databaseConfigWindow = DatabaseConfigWindow.getInstance();
  windowManager = WindowManager.getInstance();

  // Check if database is configured
  if (!databaseConfigService.hasDatabaseConfig()) {
    databaseConfigWindow.createWindow();
    return;
  }

  const databaseUrl = databaseConfigService.getDatabaseUrl();
  if (!databaseUrl) {
    databaseConfigWindow.createWindow();
    return;
  }

  const success = await initializeServices(databaseUrl);
  if (success) {
    windowManager.createMainWindow();
  } else {
    databaseConfigWindow.createWindow();
  }
});

// Handle database configuration window events
ipcMain.handle("open-database-config", () => {
  databaseConfigWindow.createWindow();
});

// Handle database configuration updates
ipcMain.on("database-config-updated", async (_, newUrl: string) => {
  console.log("3. database-config-updated event received with url  ", newUrl);
  const success = await initializeServices(newUrl);
  if (success) {
    windowManager.refreshMainWindow();
  }
});

// IPC handlers
ipcMain.handle("get-config", async () => {
  return await configService.getConfig();
});

ipcMain.handle("show-add-dialog", () => {
  windowManager.createAddDialogWindow();
});

ipcMain.on("close-add-dialog", () => {
  windowManager.closeAddDialog();
});

ipcMain.handle(
  "add-notification",
  async (_, notification: NotificationConfig) => {
    await configService.addNotification(notification);
    windowManager.refreshMainWindow();
  }
);

ipcMain.handle(
  "update-notification",
  async (_, id: string, updates: Partial<NotificationConfig>) => {
    await configService.updateNotification(id, updates);
    windowManager.notifyNotificationUpdated(id);
  }
);

ipcMain.handle("delete-notification", async (_, id: string) => {
  await configService.deleteNotification(id);
  windowManager.notifyNotificationDeleted(id);
});

ipcMain.handle("toggle-notification", async (_, id: string) => {
  await configService.toggleNotification(id);
  windowManager.notifyNotificationToggled(id);
});

// Handle app quit
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    windowManager.createMainWindow();
  }
});
