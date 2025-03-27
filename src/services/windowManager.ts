import { BrowserWindow } from "electron";
import * as path from "path";

export class WindowManager {
  private static instance: WindowManager;
  private mainWindow: BrowserWindow | null = null;
  private addDialogWindow: BrowserWindow | null = null;

  private constructor() {}

  static getInstance(): WindowManager {
    if (!WindowManager.instance) {
      WindowManager.instance = new WindowManager();
    }
    return WindowManager.instance;
  }

  createMainWindow(): void {
    this.mainWindow = new BrowserWindow({
      width: 800,
      height: 600,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
      },
    });

    this.mainWindow.loadFile(path.join(__dirname, "../../index.html"));
    this.mainWindow.maximize();
  }

  createAddDialogWindow(): void {
    this.addDialogWindow = new BrowserWindow({
      width: 400,
      height: 500,
      modal: true,
      parent: this.mainWindow!,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
      },
    });

    this.addDialogWindow.loadFile(
      path.join(__dirname, "../../add-notification.html")
    );
  }

  closeAddDialog(): void {
    if (this.addDialogWindow) {
      this.addDialogWindow.close();
      this.addDialogWindow = null;
    }
  }

  getMainWindow(): BrowserWindow | null {
    return this.mainWindow;
  }

  getAddDialogWindow(): BrowserWindow | null {
    return this.addDialogWindow;
  }

  refreshMainWindow() {
    if (this.mainWindow) {
      this.mainWindow.webContents.send("notification-added");
    }
  }

  notifyNotificationUpdated(id: string) {
    if (this.mainWindow) {
      this.mainWindow.webContents.send("notification-updated", id);
    }
  }

  notifyNotificationDeleted(id: string) {
    if (this.mainWindow) {
      this.mainWindow.webContents.send("notification-deleted", id);
    }
  }

  notifyNotificationToggled(id: string) {
    if (this.mainWindow) {
      this.mainWindow.webContents.send("notification-toggled", id);
    }
  }
}
