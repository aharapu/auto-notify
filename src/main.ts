import { app, BrowserWindow, ipcMain, Notification } from "electron";
import * as path from "path";

let mainWindow: BrowserWindow | null = null;
let notificationInterval: NodeJS.Timeout | null = null;

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 300,
    height: 200,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.loadFile(path.join(__dirname, "../index.html"));
}

app.whenReady().then(createWindow);

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

function sendNotification(): void {
  new Notification({
    title: "Time to Stretch!",
    body: "Take a moment to stretch and move around.",
  }).show();
}

ipcMain.on(
  "toggle-notifications",
  (_event: Electron.IpcMainEvent, enabled: boolean) => {
    if (enabled) {
      // Send notification immediately
      sendNotification();
      // Set up interval for every 5 minutes
      notificationInterval = setInterval(sendNotification, 0.1 * 60 * 1000);
    } else {
      // Clear the interval when notifications are disabled
      if (notificationInterval) {
        clearInterval(notificationInterval);
        notificationInterval = null;
      }
    }
  }
);
