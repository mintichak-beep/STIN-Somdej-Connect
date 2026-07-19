import React, { useState, useEffect } from 'react';
import { UserService } from '../services/user.service';
import { User } from '../types/db';
import { Users, Plus, UserPlus } from 'lucide-react';
import { LoadingSkeleton } from '../components/LoadingSkeleton';

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
        const data = await UserService.getAll();
        setUsers(data);
        setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">User Management</h2>
        <button className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-700">
          <UserPlus className="h-4 w-4" /> Create User
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map(user => (
            <div key={user.uid} className="bg-white dark:bg-zinc-900 p-4 rounded-xl border">
                <div className="flex justify-between items-start mb-2">
                    <Users className="text-red-500" />
                    <span className={`text-xs font-bold px-2 py-1 rounded ${user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{user.status}</span>
                </div>
                <h4 className="font-bold">{user.name}</h4>
                <p className="text-sm text-gray-600">{user.email}</p>
                <p className="text-xs text-gray-500 mt-2">Role: {user.role}</p>
            </div>
        ))}
      </div>
    </div>
  );
}
