import { deduplicationService } from "../services/deduplication.service";

async function runCleanup() {
  console.log("----------------------------------------");
  console.log("Starting STIN-Somdej Connect Database Deduplication Check");
  console.log("----------------------------------------");
  
  try {
    console.log("Scanning all collections for duplicates...");
    const scanResult = await deduplicationService.scanDuplicates();
    
    console.log(`Scan completed. Found ${scanResult.totalDuplicates} duplicate records across all collections.`);
    
    for (const colName of Object.keys(scanResult.byCollection)) {
      const colData = scanResult.byCollection[colName];
      if (colData.totalCount > 0) {
        console.log(`\nCollection: [${colName}] (${colData.displayName})`);
        console.log(`- Total duplicates to remove: ${colData.totalCount}`);
        
        for (const group of colData.duplicateGroups) {
          console.log(`  - Duplicate Key: "${group.duplicateKey}"`);
          console.log(`    Keep: ${group.toKeep.id} (Created: ${group.toKeep.createdAt?.toDate ? group.toKeep.createdAt.toDate().toISOString() : group.toKeep.createdAt})`);
          console.log(`    Delete: ${group.toDelete.map((d: any) => d.id).join(", ")}`);
        }
      }
    }

    if (scanResult.totalDuplicates > 0) {
      console.log("\n----------------------------------------");
      console.log("Proceeding to clean up duplicates (keeping the latest valid record of each group)...");
      const deletedCount = await deduplicationService.cleanDuplicates(scanResult);
      console.log(`Cleanup completed successfully! Removed ${deletedCount} duplicate records.`);
    } else {
      console.log("\nNo duplicates found! Database is fully clean.");
    }
  } catch (err) {
    console.error("Error during duplication check & cleanup:", err);
  }
  
  console.log("----------------------------------------");
  process.exit(0);
}

runCleanup();
