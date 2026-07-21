import { FirestoreService } from "./firestore.service";

export interface AppSettings {
  id?: string;
  loginImageUrl?: string;
  updatedAt?: any;
}

class AppSettingsService extends FirestoreService<AppSettings> {
  constructor() {
    super("appSettings");
  }

  async getSettings(): Promise<AppSettings | null> {
    const list = await this.getAll();
    if (list.length > 0) {
      return list[0];
    }
    return null;
  }

  async saveSettings(settings: Partial<AppSettings>): Promise<void> {
    const list = await this.getAll();
    if (list.length > 0) {
      await this.update(list[0].id!, { ...settings, updatedAt: new Date() });
    } else {
      await this.create({ ...settings, updatedAt: new Date() } as any);
    }
  }
}

export const appSettingsService = new AppSettingsService();
