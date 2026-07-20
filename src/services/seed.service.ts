import { doc, setDoc, getDocs, collection, Timestamp } from "firebase/firestore";
import { db } from "../lib/firebase";

export async function seedDatabaseIfEmpty() {
  // Database seeding is disabled to ensure an empty database on first deploy.
  // Administrators must manually create all records.
  return;
}
