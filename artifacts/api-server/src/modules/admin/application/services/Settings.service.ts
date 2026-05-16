import { db, systemSettingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { SettingItem } from "@workspace/api-zod";

export class SettingsService {
  async getAll(): Promise<SettingItem[]> {
    const rows = await db.select().from(systemSettingsTable).orderBy(systemSettingsTable.category);
    return rows.map((r) => ({
      key: r.key,
      value: r.value,
      category: r.category as SettingItem["category"],
    }));
  }

  async upsertMany(settings: SettingItem[]): Promise<void> {
    if (settings.length === 0) return;
    await db.transaction(async (tx) => {
      for (const s of settings) {
        await tx
          .insert(systemSettingsTable)
          .values({ key: s.key, value: s.value, category: s.category, updatedAt: new Date() })
          .onConflictDoUpdate({
            target: systemSettingsTable.key,
            set: { value: s.value, updatedAt: new Date() },
          });
      }
    });
  }
}
