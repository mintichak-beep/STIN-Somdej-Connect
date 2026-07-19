import { EvaluationForm, Evaluation } from '../types/db';

export const evaluationService = {
  getForms: async (): Promise<EvaluationForm[]> => [],
  createForm: async (data: Omit<EvaluationForm, 'id' | 'createdAt'>): Promise<string> => {
    const list = [];
    const newForm: EvaluationForm = { ...data, id: `f-${Date.now()}`, createdAt: new Date().toISOString() };
    list.push(newForm);
    void 0;
    return newForm.id;
  },
  saveEvaluation: async (data: Omit<Evaluation, 'id' | 'createdAt'>): Promise<string> => {
    const list = [];
    const newEval: Evaluation = { ...data, id: `e-${Date.now()}`, createdAt: new Date().toISOString() };
    list.push(newEval);
    void 0;
    return newEval.id;
  },
  getStudentEvaluations: async (studentId: string): Promise<Evaluation[]> => {
    return [].filter(e => e.studentId === studentId);
  }
};
