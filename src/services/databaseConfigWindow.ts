import { BrowserWindow, ipcMain } from "electron";
import * as path from "path";
import { DatabaseConfigService } from "./databaseConfigService";

export class DatabaseConfigWindow {
  private static instance: DatabaseConfigWindow;
  private window: BrowserWindow | null = null;
  private dbConfigService: DatabaseConfigService;

  private constructor() {
    this.dbConfigService = DatabaseConfigService.getInstance();
    this.setupIpcHandlers();
  }

  static getInstance(): DatabaseConfigWindow {
    if (!DatabaseConfigWindow.instance) {
      DatabaseConfigWindow.instance = new DatabaseConfigWindow();
    }
    return DatabaseConfigWindow.instance;
  }

  private setupIpcHandlers() {
    ipcMain.handle("get-database-url", () => {
      return this.dbConfigService.getDatabaseUrl();
    });

    ipcMain.handle("save-database-url", async (_, url: string) => {
      console.log("1. saving database url", url);
      this.dbConfigService.setDatabaseUrl(url);
      // Notify main process that database config was updated
      console.log("2. notifying main process that database config was updated");
      ipcMain.emit("database-config-updated", null, url);
      return true;
    });
  }

  createWindow() {
    if (this.window) {
      this.window.focus();
      return;
    }

    this.window = new BrowserWindow({
      width: 600,
      height: 400,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
      },
    });

    this.window.loadFile(
      path.join(__dirname, "../../src/renderer/database-config.html")
    );

    this.window.on("closed", () => {
      this.window = null;
    });
  }

  closeWindow() {
    if (this.window) {
      this.window.close();
      this.window = null;
    }
  }
}
