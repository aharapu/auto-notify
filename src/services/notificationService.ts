import { Notification } from "electron";
import { NotificationConfig } from "../types";
import { CronExpressionParser } from "cron-parser";

export class NotificationService {
  private static instance: NotificationService;
  private readonly notificationIntervals: Map<string, NodeJS.Timeout> =
    new Map();

  private constructor() {}

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  sendNotification(notification: NotificationConfig): void {
    new Notification({
      title: notification.title,
      body: notification.message,
    }).show();
  }

  startNotification(notification: NotificationConfig): void {
    if (this.notificationIntervals.has(notification.id.toString())) {
      clearInterval(this.notificationIntervals.get(notification.id.toString()));
    }

    try {
      const interval = CronExpressionParser.parse(notification.cron_expression);

      // Send notification immediately
      this.sendNotification(notification);

      // Set up interval based on cron expression
      const scheduleNext = () => {
        const next = interval.next();
        const now = new Date();
        const delay = next.getTime() - now.getTime();

        const timeout = setTimeout(() => {
          this.sendNotification(notification);
          scheduleNext();
        }, delay);

        this.notificationIntervals.set(notification.id.toString(), timeout);
      };

      scheduleNext();
    } catch (error) {
      console.error(
        `Invalid cron expression for notification ${notification.id}:`,
        error
      );
    }
  }

  stopNotification(id: string): void {
    const interval = this.notificationIntervals.get(id);
    if (interval) {
      clearInterval(interval);
      this.notificationIntervals.delete(id);
    }
  }
}
