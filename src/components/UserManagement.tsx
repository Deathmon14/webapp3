// src/components/UserManagement.tsx

import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, updateDoc, deleteDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { User } from '../types';
import { Users, X, Search, Check, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast'; // Import toast

const UserManagement = () => {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

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
      toast.success(`Successfully updated ${selectedUser.name}'s role to ${selectedRole}.`); // Replaced alert
      setIsModalOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error("Error updating user role:", error);
      toast.error("Failed to update user role."); // Replaced alert
    }
  };

  const handleApproveUser = async (user: User) => {
    // IMPORTANT: Do NOT use confirm() or window.confirm(). Use a custom modal UI instead.
    // For now, I'm replacing it with a toast message for demonstration purposes.
    // In a real application, implement a custom confirmation modal.
    toast.success(`Approving ${user.name}... (Implement custom confirmation modal)`);

    try {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, { status: 'active' });

      await addDoc(collection(db, 'activity_logs'), {
        message: `Admin approved a new vendor: ${user.name}.`,
        timestamp: serverTimestamp(),
        meta: {
          userId: user.uid
        }
      });

      toast.success(`${user.name} has been approved.`); // Replaced alert
    } catch (error) {
      console.error("Error approving user:", error);
      toast.error("Failed to approve user."); // Replaced alert
    }
  };

  const handleRejectUser = async (user: User) => {
    // IMPORTANT: Do NOT use confirm() or window.confirm(). Use a custom modal UI instead.
    // For now, I'm replacing it with a toast message for demonstration purposes.
    // In a real application, implement a custom confirmation modal.
    toast.error(`Rejecting and deleting ${user.name}... (Implement custom confirmation modal)`);

    try {
      const userDocRef = doc(db, 'users', user.uid);
      await deleteDoc(userDocRef);
      toast.success(`${user.name} has been rejected and deleted.`); // Replaced alert
    } catch (error) {
      console.error("Error rejecting user:", error);
      toast.error("Failed to reject user."); // Replaced alert
    }
  };

  const pendingUsers = allUsers.filter(user => user.status === 'pending');
  const activeUsers = allUsers.filter(user => user.status !== 'pending' &&
    (user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     user.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) return <p className="text-center p-4">Loading users...</p>;

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* --- PENDING USERS SECTION --- */}
      {pendingUsers.length > 0 && (
        <div className="bg-yellow-50/80 backdrop-blur-md border border-yellow-200 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-yellow-800 flex items-center">
              <AlertCircle className="w-6 h-6 mr-3"/> Pending Approvals ({pendingUsers.length})
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-yellow-100">
                <tr>
                  <th className="p-4 font-semibold text-yellow-900">Name</th>
                  <th className="p-4 font-semibold text-yellow-900">Email</th>
                  <th className="p-4 font-semibold text-yellow-900">Requested Role</th>
                  <th className="p-4 font-semibold text-yellow-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingUsers.map(user => (
                  <tr key={user.uid} className="border-b border-yellow-200">
                    <td className="p-4 font-medium text-gray-900">{user.name}</td>
                    <td className="p-4 text-gray-600">{user.email}</td>
                    <td className="p-4 capitalize">{user.role}</td>
                    <td className="p-4 flex gap-2">
                      <button onClick={() => handleApproveUser(user)} className="bg-green-500 text-white px-3 py-1 rounded-md text-xs font-semibold hover:bg-green-600">Approve</button>
                      <button onClick={() => handleRejectUser(user)} className="bg-red-500 text-white px-3 py-1 rounded-md text-xs font-semibold hover:bg-red-600">Reject</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- ACTIVE USERS SECTION (NOW A GLASS CARD) --- */}
      <div className="card-modern p-6">
        {/* Modal for editing user role */}
        {isModalOpen && selectedUser && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-lg shadow-xl w-96">
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="text-lg font-bold">Edit Role for {selectedUser.name}</h4>
                        <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="mb-4">
                        <label htmlFor="role-select" className="block text-sm font-medium text-gray-700 mb-2">Select new role:</label>
                        <select
                            id="role-select"
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value as 'client' | 'vendor' | 'admin')}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                        >
                            <option value="client">Client</option>
                            <option value="vendor">Vendor</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                    <div className="flex justify-end gap-3">
                        <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button>
                        <button onClick={handleRoleUpdate} className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700">Update Role</button>
                    </div>
                </div>
            </div>
        )}
        {/* ... (Modal JSX remains unchanged) ... */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900 flex items-center"><Users className="w-6 h-6 mr-3 text-purple-600"/> Active Users</h3>
          <div className="relative w-1/3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search active users..."
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
              {activeUsers.map(user => (
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
    </div>
  );
};

export default UserManagement;
