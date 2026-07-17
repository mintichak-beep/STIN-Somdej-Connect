export type WorkflowStatus = 'idle' | 'running' | 'completed' | 'failed';

export interface WorkflowStep {
  id: string;
  label: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
}

export interface WorkflowState {
  status: WorkflowStatus;
  currentStep: string;
  progress: number;
  steps: WorkflowStep[];
  warnings: string[];
  errors: string[];
  summary: {
    importedStudents: number;
    accommodationGroups: number;
    roomsUsed: number;
    studentsAssigned: number;
    transportationTrips: number;
  };
}
