import { app, BrowserWindow, ipcMain, Notification } from "electron";
import * as path from "path";
import { ConfigService } from "./config";
import { NotificationConfig } from "./types";
import { CronExpressionParser } from "cron-parser";

let mainWindow: BrowserWindow | null = null;
const notificationIntervals: Map<string, NodeJS.Timeout> = new Map();
const configService = ConfigService.getInstance();

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 600,
    height: 400,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    icon: path.join(__dirname, "../src/assets/icon.ico"),
  });

  mainWindow.loadFile(path.join(__dirname, "../index.html"));
}

function sendNotification(notification: NotificationConfig): void {
  if (!app.isReady()) return;

  new Notification({
    title: notification.title,
    body: notification.message,
  }).show();
}

function startNotification(notification: NotificationConfig): void {
  if (notificationIntervals.has(notification.id)) {
    clearInterval(notificationIntervals.get(notification.id));
  }

  try {
    const interval = CronExpressionParser.parse(notification.cronExpression);

    // Send notification immediately if app is ready
    if (app.isReady()) {
      sendNotification(notification);
    }

    // Set up interval based on cron expression
    const scheduleNext = () => {
      const next = interval.next();
      const now = new Date();
      const delay = next.getTime() - now.getTime();

      const timeout = setTimeout(() => {
        sendNotification(notification);
        scheduleNext();
      }, delay);

      notificationIntervals.set(notification.id, timeout);
    };

    scheduleNext();
  } catch (error) {
    console.error(
      `Invalid cron expression for notification ${notification.id}:`,
      error
    );
  }
}

function stopNotification(id: string): void {
  const interval = notificationIntervals.get(id);
  if (interval) {
    clearInterval(interval);
    notificationIntervals.delete(id);
  }
}

// IPC handlers
ipcMain.handle("get-config", () => {
  return configService.getConfig();
});

ipcMain.handle(
  "add-notification",
  (_event, notification: Omit<NotificationConfig, "id">) => {
    const newNotification = configService.addNotification(notification);
    if (newNotification.enabled) {
      startNotification(newNotification);
    }
    return newNotification;
  }
);

ipcMain.handle(
  "update-notification",
  (_event, id: string, notification: Partial<NotificationConfig>) => {
    const updated = configService.updateNotification(id, notification);
    if (updated) {
      if (updated.enabled) {
        startNotification(updated);
      } else {
        stopNotification(id);
      }
    }
    return updated;
  }
);

ipcMain.handle("delete-notification", (_event, id: string) => {
  stopNotification(id);
  return configService.deleteNotification(id);
});

ipcMain.handle("toggle-notification", (_event, id: string) => {
  const notification = configService.toggleNotification(id);
  if (notification) {
    if (notification.enabled) {
      startNotification(notification);
    } else {
      stopNotification(id);
    }
  }
  return notification;
});

// Initialize app
app.whenReady().then(() => {
  createWindow();

  // Initialize notifications from saved config after app is ready
  const config = configService.getConfig();
  config.notifications.forEach((notification) => {
    if (notification.enabled) {
      startNotification(notification);
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
    createWindow();
  }
});
