import { app } from "electron";
import * as path from "path";
import * as fs from "fs";

const DB_CONFIG_FILE = "db-config.json";

export class DatabaseConfigService {
  private static instance: DatabaseConfigService;
  private configPath: string;

  private constructor() {
    this.configPath = path.join(app.getPath("userData"), DB_CONFIG_FILE);
  }

  static getInstance(): DatabaseConfigService {
    if (!DatabaseConfigService.instance) {
      DatabaseConfigService.instance = new DatabaseConfigService();
    }
    return DatabaseConfigService.instance;
  }

  getDatabaseUrl(): string | null {
    try {
      if (fs.existsSync(this.configPath)) {
        const data = fs.readFileSync(this.configPath, "utf8");
        const config = JSON.parse(data);
        if (
          config.databaseUrl &&
          typeof config.databaseUrl === "string" &&
          config.databaseUrl.trim() !== ""
        ) {
          return config.databaseUrl;
        }
      }
    } catch (error) {
      console.error("Error reading database config:", error);
    }
    return null;
  }

  setDatabaseUrl(databaseUrl: string): void {
    if (
      !databaseUrl ||
      typeof databaseUrl !== "string" ||
      databaseUrl.trim() === ""
    ) {
      throw new Error("Invalid database URL");
    }

    try {
      const config = { databaseUrl: databaseUrl.trim() };
      fs.writeFileSync(this.configPath, JSON.stringify(config, null, 2));
    } catch (error) {
      console.error("Error saving database config:", error);
      throw error;
    }
  }

  hasDatabaseConfig(): boolean {
    return this.getDatabaseUrl() !== null;
  }
}
