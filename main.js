const { app, BrowserWindow, ipcMain, Notification } = require("electron");
const path = require("path");

let mainWindow;
let notificationInterval;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 300,
    height: 200,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.loadFile("index.html");
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

function sendNotification() {
  new Notification({
    title: "Time to Stretch!",
    body: "Take a moment to stretch and move around.",
  }).show();
}

ipcMain.on("toggle-notifications", (event, enabled) => {
  if (enabled) {
    // Send notification immediately
    sendNotification();
    // Set up interval for every 5 minutes
    notificationInterval = setInterval(sendNotification, 5 * 60 * 1000);
  } else {
    // Clear the interval when notifications are disabled
    if (notificationInterval) {
      clearInterval(notificationInterval);
      notificationInterval = null;
    }
  }
});
