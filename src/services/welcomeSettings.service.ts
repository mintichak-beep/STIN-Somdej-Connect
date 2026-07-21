import { FirestoreService } from "./firestore.service";

export interface WelcomeSetting {
  id?: string;
  key: string;
  value: string;
}

class WelcomeSettingsService extends FirestoreService<WelcomeSetting> {
  constructor() {
    super("welcomeSettings");
  }

  async getAsMap(): Promise<Record<string, string>> {
    const list = await this.getAll();
    const map: Record<string, string> = {};
    list.forEach((item) => {
      if (item.id) {
        map[item.id] = item.value;
      }
    });
    return map;
  }

  async saveSetting(key: string, value: string): Promise<void> {
    const existing = await this.getById(key);
    if (existing) {
      await this.update(key, { value });
    } else {
      await this.createWithId(key, { key, value });
    }
  }

  async resetAll(): Promise<void> {
    const list = await this.getAll();
    for (const item of list) {
      if (item.id) {
        await this.delete(item.id);
      }
    }
  }
}

export const welcomeSettingsService = new WelcomeSettingsService();
