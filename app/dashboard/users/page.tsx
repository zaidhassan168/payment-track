'use client';

import { useEffect, useState } from 'react';

type User = {
  id: string;
  email: string;
  role: string | null;
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const res = await fetch('/api/users');
    const data = await res.json();
    setUsers(data);
    setLoading(false);
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    setUpdating(userId);
    await fetch('/api/users', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, role: newRole }),
    });
    setUsers(users =>
      users.map(user =>
        user.id === userId ? { ...user, role: newRole } : user
      )
    );
    setUpdating(null);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">User Role Management</h1>
      {loading ? (
        <p>Loading users...</p>
      ) : (
        <div className="space-y-4">
          {users.map(user => (
            <div
              key={user.id}
              className="flex items-center justify-between p-4 border rounded shadow-sm"
            >
              <div>
                <p className="font-medium">{user.email}</p>
                <p className="text-sm text-gray-600">Role: {user.role || 'None'}</p>
              </div>
              <select
                title='Select role'
                className="border rounded px-3 py-1"
                value={user.role || ''}
                onChange={e => handleRoleChange(user.id, e.target.value)}
                disabled={updating === user.id}
              >
                <option value="">Select role</option>
                <option value="manager">Manager</option>
                <option value="engineer">Engineer</option>
              </select>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
