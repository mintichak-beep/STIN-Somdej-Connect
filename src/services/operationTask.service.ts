import { OperationTask } from "../types/db";

const STORAGE_KEY = "cpatms_operation_tasks";

const loadData = (): OperationTask[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

const saveData = (data: OperationTask[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const operationTaskService = {
  getAll: async (): Promise<OperationTask[]> => {
    return loadData();
  },
  create: async (
    task: Omit<OperationTask, "id" | "createdAt">,
  ): Promise<string> => {
    const list = loadData();
    const newTask: OperationTask = {
      ...task,
      id: `task-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    list.push(newTask);
    saveData(list);
    return newTask.id;
  },
  update: async (
    id: string,
    updates: Partial<OperationTask>,
  ): Promise<void> => {
    const list = loadData();
    const index = list.findIndex((t) => t.id === id);
    if (index > -1) {
      list[index] = { ...list[index], ...updates };
      saveData(list);
    }
  },
  delete: async (id: string): Promise<void> => {
    const list = loadData();
    saveData(list.filter((t) => t.id !== id));
  },
};
