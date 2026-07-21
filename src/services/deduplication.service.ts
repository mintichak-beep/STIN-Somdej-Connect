import { 
  studentService, 
  teacherService, 
  courseService, 
  subjectService,
  studentGroupService, 
  clinicalSiteService, 
  wardService, 
  clinicalScheduleService, 
  dutyAssignmentService, 
  vanTripService, 
  weeklyBillService, 
  studentPaymentService, 
  announcementService 
} from "./app.service";

export interface DuplicateGroup {
  collectionName: string;
  duplicateKey: string;
  records: any[];
  toKeep: any;
  toDelete: any[];
}

export interface ScanResult {
  totalDuplicates: number;
  byCollection: {
    [collectionName: string]: {
      displayName: string;
      totalCount: number;
      duplicateGroups: DuplicateGroup[];
    };
  };
}

function getMs(val: any): number {
  if (!val) return 0;
  if (typeof val.toMillis === "function") return val.toMillis();
  if (val.seconds !== undefined) return val.seconds * 1000 + (val.nanoseconds || 0) / 1000000;
  if (val instanceof Date) return val.getTime();
  const parsed = Date.parse(val);
  return isNaN(parsed) ? 0 : parsed;
}

export class DeduplicationService {
  private getLatestRecord(records: any[]): { toKeep: any; toDelete: any[] } {
    if (records.length <= 1) {
      return { toKeep: records[0] || null, toDelete: [] };
    }

    // Sort descending by updatedAt, then createdAt, then fallback to id
    const sorted = [...records].sort((a, b) => {
      const aTime = Math.max(getMs(a.updatedAt), getMs(a.createdAt));
      const bTime = Math.max(getMs(b.updatedAt), getMs(b.createdAt));
      if (bTime !== aTime) return bTime - aTime;
      return (b.id || "").localeCompare(a.id || "");
    });

    return {
      toKeep: sorted[0],
      toDelete: sorted.slice(1)
    };
  }

  // Returns the duplicate key for a record based on collection rules
  getDuplicateKey(collectionName: string, item: any): string {
    if (!item) return "";
    
    switch (collectionName) {
      case "students":
        return (item.studentId || "").trim().toLowerCase();
        
      case "teachers":
        return (item.teacherId || item.instructorId || item.name || "").trim().toLowerCase();
        
      case "courses":
        return (item.courseCode || "").trim().toLowerCase();
        
      case "subjects":
        return (item.subjectCode || "").trim().toLowerCase();
        
      case "studentGroups":
        return (item.name || "").trim().toLowerCase() + "::" + (item.courseId || "").trim().toLowerCase();
        
      case "clinicalSites":
        return (item.name || "").trim().toLowerCase() + "::" + (item.address || "").trim().toLowerCase();
        
      case "wards":
        return (item.name || "").trim().toLowerCase() + "::" + (item.clinicalSiteId || "").trim().toLowerCase();
        
      case "clinicalSchedules":
        return (item.courseId || "").trim().toLowerCase() + "::" + (item.startDate || "") + "::" + (item.studentGroupId || "").trim().toLowerCase() + "::" + (item.wardId || "").trim().toLowerCase();
        
      case "dutyAssignments":
        return (item.scheduleId || "").trim().toLowerCase() + "::" + (item.studentId || "").trim().toLowerCase() + "::" + (item.date || "");
        
      case "vanTrips":
        return (item.date || "") + "::" + (item.licensePlate || "").trim().toLowerCase() + "::" + (item.departureTime || "");
        
      case "studentPayments":
        return (item.studentId || "").trim().toLowerCase() + "::" + (item.billingWeek || "");
        
      case "utilityBills":
        return (item.roomId || "").trim().toLowerCase() + "::" + (item.billingWeek || "");
        
      case "announcements":
        return (item.title || "").trim().toLowerCase() + "::" + (item.content || "").trim().toLowerCase() + "::" + getMs(item.date);
        
      default:
        return "";
    }
  }

  // Scan all collections and group duplicate records
  async scanDuplicates(): Promise<ScanResult> {
    const collectionsToScan = [
      { name: "students", service: studentService, displayName: "Students" },
      { name: "teachers", service: teacherService, displayName: "Instructors (Teachers)" },
      { name: "courses", service: courseService, displayName: "Courses" },
      { name: "subjects", service: subjectService, displayName: "Subjects" },
      { name: "studentGroups", service: studentGroupService, displayName: "Student Groups" },
      { name: "clinicalSites", service: clinicalSiteService, displayName: "Clinical Sites" },
      { name: "wards", service: wardService, displayName: "Wards" },
      { name: "clinicalSchedules", service: clinicalScheduleService, displayName: "Clinical Schedules" },
      { name: "dutyAssignments", service: dutyAssignmentService, displayName: "Duty Assignments" },
      { name: "vanTrips", service: vanTripService, displayName: "Shuttle Vans (Trips)" },
      { name: "studentPayments", service: studentPaymentService, displayName: "Utility Bills (Students)" },
      { name: "utilityBills", service: weeklyBillService, displayName: "Utility Bills (Rooms)" },
      { name: "announcements", service: announcementService, displayName: "Announcements" }
    ];

    const byCollection: any = {};
    let totalDuplicates = 0;

    for (const col of collectionsToScan) {
      try {
        const records = await col.service.getAll();
        
        // Group by duplicate key
        const groups: { [key: string]: any[] } = {};
        for (const item of records) {
          const key = this.getDuplicateKey(col.name, item);
          if (!key) continue;
          if (!groups[key]) {
            groups[key] = [];
          }
          groups[key].push(item);
        }

        const duplicateGroups: DuplicateGroup[] = [];
        let duplicateCount = 0;

        for (const key of Object.keys(groups)) {
          const groupRecords = groups[key];
          if (groupRecords.length > 1) {
            const { toKeep, toDelete } = this.getLatestRecord(groupRecords);
            duplicateGroups.push({
              collectionName: col.name,
              duplicateKey: key,
              records: groupRecords,
              toKeep,
              toDelete
            });
            duplicateCount += toDelete.length;
          }
        }

        byCollection[col.name] = {
          displayName: col.displayName,
          totalCount: duplicateCount,
          duplicateGroups
        };
        totalDuplicates += duplicateCount;
      } catch (err) {
        console.error(`Error scanning duplicates for ${col.name}:`, err);
        byCollection[col.name] = {
          displayName: col.displayName,
          totalCount: 0,
          duplicateGroups: []
        };
      }
    }

    return {
      totalDuplicates,
      byCollection
    };
  }

  // Delete all duplicate records, leaving only the latest valid record
  async cleanDuplicates(result?: ScanResult): Promise<number> {
    const scan = result || await this.scanDuplicates();
    let deletedCount = 0;

    const collectionsToClean = [
      { name: "students", service: studentService },
      { name: "teachers", service: teacherService },
      { name: "courses", service: courseService },
      { name: "subjects", service: subjectService },
      { name: "studentGroups", service: studentGroupService },
      { name: "clinicalSites", service: clinicalSiteService },
      { name: "wards", service: wardService },
      { name: "clinicalSchedules", service: clinicalScheduleService },
      { name: "dutyAssignments", service: dutyAssignmentService },
      { name: "vanTrips", service: vanTripService },
      { name: "studentPayments", service: studentPaymentService },
      { name: "utilityBills", service: weeklyBillService },
      { name: "announcements", service: announcementService }
    ];

    for (const col of collectionsToClean) {
      const colData = scan.byCollection[col.name];
      if (!colData || colData.totalCount === 0) continue;

      for (const group of colData.duplicateGroups) {
        for (const dupRecord of group.toDelete) {
          try {
            if (dupRecord.id) {
              await col.service.delete(dupRecord.id);
              deletedCount++;
            }
          } catch (err) {
            console.error(`Error deleting duplicate record ${dupRecord.id} from ${col.name}:`, err);
          }
        }
      }
    }

    return deletedCount;
  }

  // Check if a potential new record would be a duplicate
  async checkDuplicateBeforeSave(collectionName: string, data: any, editingId?: string): Promise<any | null> {
    const keyToCheck = this.getDuplicateKey(collectionName, data);
    if (!keyToCheck) return null;

    let service: any;
    switch (collectionName) {
      case "students": service = studentService; break;
      case "teachers": service = teacherService; break;
      case "courses": service = courseService; break;
      case "subjects": service = subjectService; break;
      case "studentGroups": service = studentGroupService; break;
      case "clinicalSites": service = clinicalSiteService; break;
      case "wards": service = wardService; break;
      case "clinicalSchedules": service = clinicalScheduleService; break;
      case "dutyAssignments": service = dutyAssignmentService; break;
      case "vanTrips": service = vanTripService; break;
      case "studentPayments": service = studentPaymentService; break;
      case "utilityBills": service = weeklyBillService; break;
      case "announcements": service = announcementService; break;
      default: return null;
    }

    try {
      const records = await service.getAll();
      for (const item of records) {
        if (editingId && item.id === editingId) continue;
        const key = this.getDuplicateKey(collectionName, item);
        if (key === keyToCheck) {
          return item;
        }
      }
    } catch (err) {
      console.error(`Error checking duplicates for ${collectionName}:`, err);
    }

    return null;
  }
}

export const deduplicationService = new DeduplicationService();
