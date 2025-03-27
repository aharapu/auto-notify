import { Pool, PoolConfig } from "pg";
import { NotificationConfig } from "../types";

export class DatabaseService {
  private pool: Pool;

  constructor(config: PoolConfig) {
    this.pool = new Pool(config);
  }

  async query(text: string, params?: any[]) {
    const client = await this.pool.connect();
    try {
      const result = await client.query(text, params);
      return result.rows;
    } finally {
      client.release();
    }
  }

  async getNotifications(): Promise<NotificationConfig[]> {
    const result = await this.query("SELECT * FROM notifications");
    return result;
  }

  async addNotification(notification: NotificationConfig): Promise<number> {
    const result = await this.query(
      `INSERT INTO notifications (title, message, cron_expression, is_enabled)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      [
        notification.title,
        notification.message,
        notification.cron_expression,
        notification.is_enabled,
      ]
    );
    return result[0].id;
  }

  async updateNotification(
    id: string,
    updates: Partial<NotificationConfig>
  ): Promise<void> {
    const setClause = Object.entries(updates)
      .map(([key, _], index) => `${key} = $${index + 2}`)
      .join(", ");

    const values = Object.values(updates);

    await this.query(`UPDATE notifications SET ${setClause} WHERE id = $1`, [
      id,
      ...values,
    ]);
  }

  async deleteNotification(id: string): Promise<void> {
    await this.query("DELETE FROM notifications WHERE id = $1", [id]);
  }

  async toggleNotification(id: string): Promise<void> {
    await this.query(
      "UPDATE notifications SET is_enabled = NOT is_enabled WHERE id = $1",
      [id]
    );
  }

  async close() {
    await this.pool.end();
  }
}
