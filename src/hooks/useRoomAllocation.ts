import { useState } from 'react';
import { allocationService } from '../services/allocation.service';
import { Student } from '../types/student';
import { AllocationState } from '../types/allocation';

export function useRoomAllocation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const performAllocation = async (students: Student[]) => {
    setLoading(true);
    setError(null);
    try {
      // 1. Group by DRSchedule
      const grouped = students.reduce((acc, student) => {
        if (!acc[student.DRSchedule]) acc[student.DRSchedule] = [];
        acc[student.DRSchedule].push(student);
        return acc;
      }, {} as Record<string, Student[]>);

      // 2. Algorithm implementation (simplified representation)
      const assignments: AllocationState[] = [];
      const rooms = await allocationService.getAvailableRooms();
      
      let roomIndex = 0;
      
      Object.entries(grouped).forEach(([drSchedule, groupStudents]) => {
        // Simple logic for demonstration
        for (let i = 0; i < groupStudents.length; i += 4) {
          const chunk = groupStudents.slice(i, i + 4);
          if (roomIndex < rooms.length) {
            const roomId = rooms[roomIndex].id;
            chunk.forEach((student, bedIdx) => {
              assignments.push({
                studentId: student.id,
                roomId,
                bedId: `bed-${bedIdx + 1}`,
                drSchedule
              });
            });
            roomIndex++;
          }
        }
      });

      // 3. Save
      await allocationService.applyAllocation(assignments);
      return assignments;
    } catch (err) {
      setError('Allocation failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { performAllocation, loading, error };
}
