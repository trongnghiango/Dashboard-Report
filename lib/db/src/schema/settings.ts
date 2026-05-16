import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const systemSettingsTable = pgTable("system_settings", {
  key: text("key").primaryKey(),       // e.g., 'system.name', 'smtp.host'
  value: text("value").notNull(),       // plain text hoặc JSON string
  category: text("category").notNull(), // 'profile' | 'system' | 'technical'
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
