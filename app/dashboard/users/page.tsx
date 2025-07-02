'use client';

import { useEffect, useState } from 'react';
import { FirebaseUser } from '@/types/user';
import { Button } from '@/components/ui/button';
import { CreateUserModal } from '../../dashboard/users/components/CreateUserModal'; // Adjust the import path as necessary
import { EditUserModal } from '../../dashboard/users/components/EditUserModal'; // Adjust the import path as necessary
import { UserTable } from '../../dashboard/users/components/UserTable'; // Adjust the import path as necessary

export default function UsersPage() {
  const [users, setUsers] = useState<FirebaseUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<FirebaseUser | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = () => {
    setCreateModalOpen(true);
  };

  const handleEditUser = (user: FirebaseUser) => {
    setSelectedUser(user);
    setEditModalOpen(true);
  };

  const handleDeleteUser = async (uid: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      try {
        await fetch(`/api/users/${uid}`, {
          method: 'DELETE',
        });
        fetchUsers(); // Refresh the user list
      } catch (error) {
        console.error('Failed to delete user:', error);
      }
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Firebase User Management</h1>
        <Button onClick={handleCreateUser}>Add User</Button>
      </div>
      {loading ? (
        <p>Loading users...</p>
      ) : (
        <UserTable
          users={users}
          onEdit={handleEditUser}
          onDelete={handleDeleteUser}
        />
      )}
      <CreateUserModal
        isOpen={isCreateModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onUserCreated={fetchUsers}
      />
      {selectedUser && (
        <EditUserModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setEditModalOpen(false);
            setSelectedUser(null);
          }}
          user={selectedUser}
          onUserUpdated={fetchUsers}
        />
      )}
    </div>
  );
}
