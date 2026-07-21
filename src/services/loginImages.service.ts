import { FirestoreService } from "./firestore.service";
import { auth } from "../lib/firebase";

export interface LoginImageRecord {
  id?: string;
  imageType: string;
  imageUrl: string;
  updatedAt: string;
  updatedBy: string;
}

class LoginImagesService extends FirestoreService<LoginImageRecord> {
  constructor() {
    super("loginImages");
  }

  async getAsMap(): Promise<Record<string, string>> {
    const list = await this.getAll();
    const map: Record<string, string> = {};
    list.forEach((item) => {
      const type = item.imageType || item.id;
      if (type && item.imageUrl) {
        map[type] = item.imageUrl;
      }
    });
    return map;
  }

  async saveImage(imageType: string, imageUrl: string): Promise<void> {
    const userEmail = auth.currentUser?.email || "admin@stin.ac.th";
    const data: LoginImageRecord = {
      imageType,
      imageUrl,
      updatedAt: new Date().toISOString(),
      updatedBy: userEmail,
    };
    
    const existing = await this.getById(imageType);
    if (existing) {
      await this.update(imageType, data);
    } else {
      await this.createWithId(imageType, data);
    }
  }

  async removeImageRecord(imageType: string): Promise<void> {
    try {
      await this.delete(imageType);
    } catch (e) {
      console.error("Error deleting login image record:", e);
    }
  }

  async resetAll(): Promise<void> {
    const list = await this.getAll();
    for (const item of list) {
      const type = item.id || item.imageType;
      if (type) {
        await this.delete(type);
      }
    }
  }
}

export const loginImagesService = new LoginImagesService();
