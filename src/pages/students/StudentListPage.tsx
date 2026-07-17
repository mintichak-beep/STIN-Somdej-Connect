import React, { useState } from 'react';
import { Sidebar } from '../../components/Sidebar';
import { StudentTable } from '../../components/students/StudentTable';
import { StudentStatisticsCard } from '../../components/students/StudentStatisticsCard';
import { StudentDialog } from '../../components/students/StudentDialog';
import { useStudents } from '../../hooks/useStudents';
import { studentService } from '../../services/student.service';
import { Student } from '../../types/student';
import { Box, Typography, Button, TextField } from '@mui/material';

export function StudentListPage() {
  const { students, loading } = useStudents();
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | undefined>();

  const filteredStudents = students.filter(s => 
    s.studentName.toLowerCase().includes(search.toLowerCase()) ||
    s.studentNumber.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async (data: Omit<Student, 'id'>) => {
    if (editingStudent) {
      await studentService.update(editingStudent.id, data);
    } else {
      await studentService.create(data);
    }
  };

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure?')) {
      await studentService.delete(id);
    }
  };

  return (
    <div className="flex h-screen w-screen bg-slate-50 dark:bg-zinc-950">
      <Sidebar />
      <main className="flex-1 p-6 overflow-auto">
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4">Students</Typography>
          <Button variant="contained" color="primary" onClick={() => { setEditingStudent(undefined); setDialogOpen(true); }}>Create Student</Button>
        </Box>
        <StudentStatisticsCard students={students} />
        <TextField 
          fullWidth 
          label="Search by name or student number" 
          variant="outlined" 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ mb: 3 }}
        />
        {loading ? <Typography>Loading...</Typography> : 
          <StudentTable data={filteredStudents} onEdit={handleEdit} onDelete={handleDelete} />
        }
        <StudentDialog 
          open={dialogOpen} 
          onClose={() => setDialogOpen(false)} 
          onSubmit={handleSubmit} 
          initialData={editingStudent}
        />
      </main>
    </div>
  );
}
