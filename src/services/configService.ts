import { app } from "electron";
import { DatabaseService } from "./databaseService";
import { AppConfig, NotificationConfig } from "../types";

const CONFIG_FILE = "config.json";

export class ConfigService {
  private static instance: ConfigService;
  private notifications: NotificationConfig[] = [];
  private db: DatabaseService | null = null;
  private initialized: boolean = false;

  private constructor() {}

  static async getInstance(dbConfig?: any): Promise<ConfigService> {
    console.log("ConfigService.getInstance called with dbConfig", dbConfig);
    if (!ConfigService.instance) {
      if (!dbConfig) {
        throw new Error(
          "Database configuration is required for first initialization"
        );
      }
      ConfigService.instance = new ConfigService();
      await ConfigService.instance.initialize(dbConfig);
    } else if (dbConfig) {
      // If instance exists and new config is provided, reinitialize
      await ConfigService.instance.initialize(dbConfig);
    }
    return ConfigService.instance;
  }

  private async initialize(dbConfig: any) {
    if (this.db) {
      await this.db.close();
    }
    this.db = new DatabaseService(dbConfig);
    console.log("databaseService initialized with config", dbConfig);
    await this.loadNotifications();
  }

  private async loadNotifications() {
    if (!this.db) {
      throw new Error("Database service not initialized");
    }
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
    if (!this.db) {
      throw new Error("Database service not initialized");
    }
    const id = await this.db.addNotification(notification);
    this.notifications.push({ ...notification, id });
  }

  async updateNotification(id: string, updates: Partial<NotificationConfig>) {
    if (!this.db) {
      throw new Error("Database service not initialized");
    }
    await this.db.updateNotification(id, updates);
    const index = this.notifications.findIndex((n) => n.id === parseInt(id));
    if (index !== -1) {
      this.notifications[index] = {
        ...this.notifications[index],
        ...updates,
      };
    }
  }

  async deleteNotification(id: string) {
    if (!this.db) {
      throw new Error("Database service not initialized");
    }
    await this.db.deleteNotification(id);
    this.notifications = this.notifications.filter(
      (n) => n.id !== parseInt(id)
    );
  }

  async toggleNotification(id: string) {
    if (!this.db) {
      throw new Error("Database service not initialized");
    }
    await this.db.toggleNotification(id);
    const notification = this.notifications.find((n) => n.id === parseInt(id));
    if (notification) {
      notification.is_enabled = !notification.is_enabled;
    }
  }

  async close() {
    if (this.db) {
      await this.db.close();
      this.db = null;
    }
  }
}
