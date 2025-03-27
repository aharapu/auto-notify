import { app } from "electron";
import { DatabaseService } from "./databaseService";
import { AppConfig, NotificationConfig } from "../types";

const CONFIG_FILE = "config.json";

export class ConfigService {
  private static instance: ConfigService;
  private notifications: NotificationConfig[] = [];
  private readonly db: DatabaseService;
  private initialized: boolean = false;

  private constructor(dbConfig: any) {
    this.db = new DatabaseService(dbConfig);
  }

  static async getInstance(dbConfig?: any): Promise<ConfigService> {
    if (!ConfigService.instance) {
      if (!dbConfig) {
        throw new Error(
          "Database configuration is required for first initialization"
        );
      }
      ConfigService.instance = new ConfigService(dbConfig);
      await ConfigService.instance.loadNotifications();
    }
    return ConfigService.instance;
  }

  private async loadNotifications() {
    this.notifications = await this.db.getNotifications();
    this.initialized = true;
  }

  async getConfig(): Promise<AppConfig> {
    if (!this.initialized) {
      await this.loadNotifications();
    }
    return { notifications: this.notifications };
  }

  async addNotification(notification: NotificationConfig) {
    await this.db.addNotification(notification);
    this.notifications.push(notification);
  }

  async updateNotification(id: string, updates: Partial<NotificationConfig>) {
    await this.db.updateNotification(id, updates);
    const index = this.notifications.findIndex((n) => n.id === id);
    if (index !== -1) {
      this.notifications[index] = {
        ...this.notifications[index],
        ...updates,
      };
    }
  }

  async deleteNotification(id: string) {
    await this.db.deleteNotification(id);
    this.notifications = this.notifications.filter((n) => n.id !== id);
  }

  async toggleNotification(id: string) {
    await this.db.toggleNotification(id);
    const notification = this.notifications.find((n) => n.id === id);
    if (notification) {
      notification.is_enabled = !notification.is_enabled;
    }
  }

  async close() {
    await this.db.close();
  }
}
