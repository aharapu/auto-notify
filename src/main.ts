import { app, BrowserWindow, ipcMain } from "electron";
import { NotificationService } from "./services/notificationService";
import { WindowManager } from "./services/windowManager";
import { NotificationConfig } from "./types";
import { ConfigService } from "./services/configService";

const configService = ConfigService.getInstance();
const notificationService = NotificationService.getInstance();
const windowManager = WindowManager.getInstance();

// IPC handlers
ipcMain.handle("get-config", () => {
  return configService.getConfig();
});

ipcMain.handle("show-add-dialog", () => {
  windowManager.createAddDialogWindow();
});

ipcMain.on("close-add-dialog", () => {
  windowManager.closeAddDialog();
});

ipcMain.handle(
  "add-notification",
  (_event, notification: Omit<NotificationConfig, "id">) => {
    const newNotification = configService.addNotification(notification);
    if (newNotification.enabled) {
      notificationService.startNotification(newNotification);
    }
    // Notify main window to refresh
    windowManager.getMainWindow()?.webContents.send("notification-added");
    return newNotification;
  }
);

ipcMain.handle(
  "update-notification",
  (_event, id: string, notification: Partial<NotificationConfig>) => {
    const updated = configService.updateNotification(id, notification);
    if (updated) {
      if (updated.enabled) {
        notificationService.startNotification(updated);
      } else {
        notificationService.stopNotification(id);
      }
    }
    return updated;
  }
);

ipcMain.handle("delete-notification", (_event, id: string) => {
  notificationService.stopNotification(id);
  return configService.deleteNotification(id);
});

ipcMain.handle("toggle-notification", (_event, id: string) => {
  const notification = configService.toggleNotification(id);
  if (notification) {
    if (notification.enabled) {
      notificationService.startNotification(notification);
    } else {
      notificationService.stopNotification(id);
    }
  }
  return notification;
});

// Initialize app
app.whenReady().then(() => {
  windowManager.createMainWindow();

  // Initialize notifications from saved config after app is ready
  const config = configService.getConfig();
  config.notifications.forEach((notification) => {
    if (notification.enabled) {
      notificationService.startNotification(notification);
    }
  });
});

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
