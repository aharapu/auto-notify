export interface NotificationConfig {
  id: string;
  title: string;
  message: string;
  frequency: {
    hours: number;
    minutes: number;
    seconds: number;
  };
  enabled: boolean;
}

export interface AppConfig {
  notifications: NotificationConfig[];
}
