import { useState, useEffect } from 'react';
import { trainingGroupService } from '../services/trainingGroup.service';
import { TrainingGroup } from '../types/db';

export function useTrainingGroups() {
  const [trainingGroups, setTrainingGroups] = useState<TrainingGroup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = trainingGroupService.subscribe((data) => {
      setTrainingGroups(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const createGroup = async (data: Omit<TrainingGroup, 'id'>) => {
    return await trainingGroupService.create(data);
  };

  const updateGroup = async (id: string, data: Partial<TrainingGroup>) => {
    await trainingGroupService.update(id, data);
  };

  const deleteGroup = async (id: string) => {
    await trainingGroupService.delete(id);
  };

  return {
    trainingGroups,
    loading,
    createGroup,
    updateGroup,
    deleteGroup
  };
}
export default useTrainingGroups;
