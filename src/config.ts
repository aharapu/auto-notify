import { app } from "electron";
import * as fs from "fs";
import * as path from "path";
import { AppConfig, NotificationConfig } from "./types";

const CONFIG_FILE = "config.json";

export class ConfigService {
  private static instance: ConfigService;
  private config: AppConfig;

  private constructor() {
    this.config = this.loadConfig();
  }

  static getInstance(): ConfigService {
    if (!ConfigService.instance) {
      ConfigService.instance = new ConfigService();
    }
    return ConfigService.instance;
  }

  private getConfigPath(): string {
    return path.join(app.getPath("userData"), CONFIG_FILE);
  }

  private loadConfig(): AppConfig {
    try {
      const configPath = this.getConfigPath();
      if (fs.existsSync(configPath)) {
        const data = fs.readFileSync(configPath, "utf8");
        return JSON.parse(data);
      }
    } catch (error) {
      console.error("Error loading config:", error);
    }
    return { notifications: [] };
  }

  private saveConfig(): void {
    try {
      const configPath = this.getConfigPath();
      fs.writeFileSync(configPath, JSON.stringify(this.config, null, 2));
    } catch (error) {
      console.error("Error saving config:", error);
    }
  }

  getConfig(): AppConfig {
    return this.config;
  }

  addNotification(
    notification: Omit<NotificationConfig, "id">
  ): NotificationConfig {
    const newNotification: NotificationConfig = {
      ...notification,
      id: Date.now(),
    };
    this.config.notifications.push(newNotification);
    this.saveConfig();
    return newNotification;
  }

  updateNotification(
    id: string,
    notification: Partial<NotificationConfig>
  ): NotificationConfig | null {
    const index = this.config.notifications.findIndex(
      (n) => n.id === parseInt(id)
    );
    if (index === -1) return null;

    this.config.notifications[index] = {
      ...this.config.notifications[index],
      ...notification,
    };
    this.saveConfig();
    return this.config.notifications[index];
  }

  deleteNotification(id: string): boolean {
    const index = this.config.notifications.findIndex(
      (n) => n.id === parseInt(id)
    );
    if (index === -1) return false;

    this.config.notifications.splice(index, 1);
    this.saveConfig();
    return true;
  }

  toggleNotification(id: string): NotificationConfig | null {
    const notification = this.config.notifications.find(
      (n) => n.id === parseInt(id)
    );
    if (!notification) return null;

    notification.is_enabled = !notification.is_enabled;
    this.saveConfig();
    return notification;
  }
}
