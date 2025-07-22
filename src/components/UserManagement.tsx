// src/components/UserManagement.tsx

import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { User } from '../types';
import { Users, X, Search } from 'lucide-react';

const UserManagement = () => {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // State for the edit modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedRole, setSelectedRole] = useState<'client' | 'vendor' | 'admin'>('client');

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'users'), (snapshot) => {
      const usersData = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as User));
      setAllUsers(usersData);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const openUserModal = (user: User) => {
    setSelectedUser(user);
    setSelectedRole(user.role);
    setIsModalOpen(true);
  };

  const handleRoleUpdate = async () => {
    if (!selectedUser) return;
    try {
      const userDocRef = doc(db, 'users', selectedUser.uid);
      await updateDoc(userDocRef, { role: selectedRole });
      alert(`Successfully updated ${selectedUser.name}'s role to ${selectedRole}.`);
      setIsModalOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error("Error updating user role:", error);
      alert("Failed to update user role.");
    }
  };

  const filteredUsers = allUsers.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <p className="text-center p-4">Loading users...</p>;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      {isModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
                <div className="p-6 border-b"><div className="flex justify-between items-center"><h3 className="text-xl font-bold text-gray-900">Manage User Role</h3><button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full"><X className="w-6 h-6" /></button></div></div>
                <div className="p-6 space-y-4">
                    <div><label className="block text-sm font-medium text-gray-700">User</label><p className="font-semibold text-gray-900">{selectedUser.name}</p><p className="text-sm text-gray-500">{selectedUser.email}</p></div>
                    <div>
                        <label htmlFor="role-select" className="block text-sm font-medium text-gray-700">Role</label>
                        <select id="role-select" value={selectedRole} onChange={(e) => setSelectedRole(e.target.value as User['role'])} className="mt-1 w-full p-2 border border-gray-300 rounded-md">
                            <option value="client">Client</option>
                            <option value="vendor">Vendor</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                </div>
                <div className="p-6 bg-gray-50 border-t rounded-b-2xl"><button onClick={handleRoleUpdate} className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition">Save Changes</button></div>
            </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 flex items-center"><Users className="w-6 h-6 mr-3 text-purple-600"/> All Users</h3>
        <div className="relative w-1/3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search users..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
          />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-4 font-semibold">Name</th>
              <th className="p-4 font-semibold">Email</th>
              <th className="p-4 font-semibold">Role</th>
              <th className="p-4 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user.uid} className="border-b hover:bg-gray-50">
                <td className="p-4 font-medium text-gray-900">{user.name}</td>
                <td className="p-4 text-gray-600">{user.email}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    user.role === 'admin' ? 'bg-red-100 text-red-700' :
                    user.role === 'vendor' ? 'bg-green-100 text-green-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>{user.role}</span>
                </td>
                <td className="p-4">
                  <button onClick={() => openUserModal(user)} className="text-blue-600 hover:underline font-medium">Edit Role</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;