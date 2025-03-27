import { app, BrowserWindow, ipcMain } from "electron";
import * as path from "path";
import { NotificationService } from "./services/notificationService";
import { WindowManager } from "./services/windowManager";
import { NotificationConfig } from "./types";
import { ConfigService } from "./services/configService";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

// Database configuration
const dbConfig = {
  connectionString: process.env.DATABASE_URL,
};

// Initialize services
let configService: ConfigService;
let notificationService: NotificationService;
let windowManager: WindowManager;

// Initialize app
app.whenReady().then(async () => {
  // Initialize services
  configService = await ConfigService.getInstance(dbConfig);
  notificationService = NotificationService.getInstance();
  windowManager = WindowManager.getInstance();

  windowManager.createMainWindow();

  // Initialize notifications from saved config after app is ready
  const config = await configService.getConfig();
  config.notifications.forEach((notification: NotificationConfig) => {
    if (notification.is_enabled) {
      notificationService.startNotification(notification);
    }
  });
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

app.on("window-all-closed", async () => {
  await configService.close();
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    windowManager.createMainWindow();
  }
});
