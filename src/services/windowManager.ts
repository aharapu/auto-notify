import { BrowserWindow } from "electron";
import * as path from "path";

export class WindowManager {
  private static instance: WindowManager;
  private mainWindow: BrowserWindow | undefined;
  private addDialogWindow: BrowserWindow | undefined;

  private constructor() {}

  static getInstance(): WindowManager {
    if (!WindowManager.instance) {
      WindowManager.instance = new WindowManager();
    }
    return WindowManager.instance;
  }

  createMainWindow(): void {
    this.mainWindow = new BrowserWindow({
      width: 600,
      height: 400,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
      },
      icon: path.join(__dirname, "../../src/assets/icon.ico"),
    });

    this.mainWindow.maximize();
    this.mainWindow.loadFile(path.join(__dirname, "../../index.html"));
  }

  createAddDialogWindow(): void {
    this.addDialogWindow = new BrowserWindow({
      width: 600,
      height: 500,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
      },
      parent: this.mainWindow,
      modal: true,
      icon: path.join(__dirname, "../../src/assets/icon.ico"),
    });

    this.addDialogWindow.loadFile(
      path.join(__dirname, "../../add-notification.html")
    );
  }

  closeAddDialog(): void {
    if (this.addDialogWindow) {
      this.addDialogWindow.close();
      this.addDialogWindow = undefined;
    }
  }

  getMainWindow(): BrowserWindow | undefined {
    return this.mainWindow;
  }

  getAddDialogWindow(): BrowserWindow | undefined {
    return this.addDialogWindow;
  }
}
