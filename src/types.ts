export interface NotificationConfig {
  id: string;
  title: string;
  message: string;
  cron_expression: string;
  is_enabled: boolean;
}

export interface AppConfig {
  notifications: NotificationConfig[];
}
