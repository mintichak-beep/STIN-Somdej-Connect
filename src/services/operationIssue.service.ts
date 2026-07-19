import { mockDB } from "./mockData";
import { OperationIssue } from "../types/db";

const STORAGE_KEY = "cpatms_operation_issues";

const loadData = (): OperationIssue[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

const saveData = (data: OperationIssue[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const operationIssueService = {
  getAll: async (): Promise<OperationIssue[]> => {
    return loadData();
  },
  create: async (
    issue: Omit<OperationIssue, "id" | "createdAt">,
  ): Promise<string> => {
    const list = loadData();
    const newIssue: OperationIssue = {
      ...issue,
      id: `issue-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    list.push(newIssue);
    saveData(list);
    return newIssue.id;
  },
  update: async (
    id: string,
    updates: Partial<OperationIssue>,
  ): Promise<void> => {
    const list = loadData();
    const index = list.findIndex((i) => i.id === id);
    if (index > -1) {
      list[index] = { ...list[index], ...updates };
      saveData(list);
    }
  },
};
