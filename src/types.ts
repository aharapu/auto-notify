export interface NotificationConfig {
  id: string;
  title: string;
  message: string;
  cronExpression: string;
  enabled: boolean;
}

export interface AppConfig {
  notifications: NotificationConfig[];
}
