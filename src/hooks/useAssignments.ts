import { useState, useEffect } from 'react';
import { assignmentService } from '../services/assignment.service';
import { TransportAssignment } from '../types/transportation';

export function useAssignments() {
  const [assignments, setAssignments] = useState<TransportAssignment[]>([]);
  useEffect(() => {
    return assignmentService.subscribe(setAssignments);
  }, []);
  return { assignments };
}
