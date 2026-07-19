import { mockDB } from './mockData';
import { EvaluationForm, Evaluation } from '../types/db';

export const evaluationService = {
  getForms: async (): Promise<EvaluationForm[]> => mockDB.getEvaluationForms(),
  createForm: async (data: Omit<EvaluationForm, 'id' | 'createdAt'>): Promise<string> => {
    const list = mockDB.getEvaluationForms();
    const newForm: EvaluationForm = { ...data, id: `f-${Date.now()}`, createdAt: new Date().toISOString() };
    list.push(newForm);
    mockDB.saveEvaluationForms(list);
    return newForm.id;
  },
  saveEvaluation: async (data: Omit<Evaluation, 'id' | 'createdAt'>): Promise<string> => {
    const list = mockDB.getEvaluations();
    const newEval: Evaluation = { ...data, id: `e-${Date.now()}`, createdAt: new Date().toISOString() };
    list.push(newEval);
    mockDB.saveEvaluations(list);
    return newEval.id;
  },
  getStudentEvaluations: async (studentId: string): Promise<Evaluation[]> => {
    return mockDB.getEvaluations().filter(e => e.studentId === studentId);
  }
};
