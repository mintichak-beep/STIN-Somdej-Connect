export interface PracticeSite {
  id: string;
  code: string;
  name: string;
  hospitalType: string;
  province: string;
  district: string;
  address: string;
  contactPerson: string;
  phoneNumber: string;
  email: string;
  availableDepartments: string[];
  maxStudentCapacity: number;
  notes?: string;
  status: 'Active' | 'Inactive';
  createdAt: Date;
  updatedAt: Date;
}
