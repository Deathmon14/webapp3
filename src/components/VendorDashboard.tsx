// src/components/VendorDashboard.tsx

import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Calendar, Clock, CheckCircle, AlertCircle, FileText, User } from 'lucide-react';
import { User as UserType, VendorTask } from '../types';

interface VendorDashboardProps {
  user: UserType;
}

const VendorDashboard: React.FC<VendorDashboardProps> = ({ user }) => {
  const [tasks, setTasks] = useState<VendorTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<VendorTask | null>(null);
  const [isUpdating, setIsUpdating] = useState(false); // New state for loading

  // Fetch tasks from Firestore in real-time
  useEffect(() => {
    setLoading(true);
    // Create a query to get tasks where the vendorId matches the current user's uid
    const q = query(collection(db, 'tasks'), where('vendorId', '==', user.uid));
    
    // onSnapshot creates a real-time listener for the query
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const tasksData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as VendorTask[];
      setTasks(tasksData);
      setLoading(false);
    });

    // Cleanup the listener when the component unmounts
    return () => unsubscribe(); 
  }, [user.uid]);

  // Update task status in Firestore
  const updateTaskStatus = async (taskId: string, newStatus: VendorTask['status']) => {
    setIsUpdating(true); // Set loading true when update starts
    const taskDocRef = doc(db, 'tasks', taskId);
    try {
      await updateDoc(taskDocRef, { status: newStatus });
      // The onSnapshot listener will automatically update the UI, but we can also update the selected task locally for immediate feedback
      if (selectedTask?.id === taskId) {
        setSelectedTask(prev => prev ? { ...prev, status: newStatus } : null);
      }
    } catch (error) {
      console.error("Error updating task status: ", error);
      alert("Failed to update task status.");
    } finally {
      setIsUpdating(false); // Set loading false when update finishes (success or error)
    }
  };

  const getStatusIcon = (status: VendorTask['status']) => {
    switch (status) {
      case 'assigned':
        return <AlertCircle className="w-5 h-5 text-orange-500" />;
      case 'in-progress':
        return <Clock className="w-5 h-5 text-blue-500" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: VendorTask['status']) => {
    switch (status) {
      case 'assigned':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'in-progress':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  // --- UPDATED DATE FORMATTING FUNCTIONS ---
  const formatDate = (dateString: any) => {
    const date = dateString?.seconds ? new Date(dateString.seconds * 1000) : new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid Date";
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getRelativeDateText = (dateString: any) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const eventDate = dateString?.seconds ? new Date(dateString.seconds * 1000) : new Date(dateString);
    eventDate.setHours(0, 0, 0, 0);

    const diffTime = eventDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return <span className="ml-2 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">Overdue</span>;
    }
    if (diffDays === 0) {
      return <span className="ml-2 px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">Due Today</span>;
    }
    if (diffDays <= 7) {
      return <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">Due in {diffDays} days</span>;
    }
    return null; // No indicator if it's more than a week away
  };

  const stats = {
    total: tasks.length,
    assigned: tasks.filter(t => t.status === 'assigned').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
    completed: tasks.filter(t => t.status === 'completed').length
  };

  if (loading) {
    return <div className="text-center p-12">Loading your assigned tasks...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-4xl font-bold text-neutral-900 mb-2">
          Welcome back, {user.name}!
        </h2>
        <p className="text-lg text-neutral-600">
          Here are your assigned tasks. Let's make some events happen.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Tasks</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-lg border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Assigned</p>
              <p className="text-2xl font-bold text-orange-600">{stats.assigned}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Tasks List */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Your Tasks</h3>
          <div className="space-y-4">
            {tasks.map((task) => {
              const relativeDate = getRelativeDateText(task.eventDate);
              return (
                <div key={task.id} onClick={() => setSelectedTask(task)} className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md ${selectedTask?.id === task.id ? 'border-primary-300 bg-primary-50' : 'border-gray-200 hover:border-primary-200'}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">{task.title}</h4>
                      <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                      {/* --- UPDATED DATE DISPLAY --- */}
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="w-4 h-4 mr-1" />
                        <span>{formatDate(task.eventDate)}</span>
                        {task.status !== 'completed' && relativeDate}
                      </div>
                    </div>
                    <div className="ml-4">{getStatusIcon(task.status)}</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(task.status)}`}>
                      {task.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                    <span className="text-sm font-medium text-purple-600 capitalize">
                      {task.category}
                    </span>
                  </div>
                </div>
              );
            })}
            {tasks.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-gray-400" />
                </div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">No tasks assigned yet</h4>
                <p className="text-gray-600">New tasks will appear here when they're assigned to you.</p>
              </div>
            )}
          </div>
        </div>

        {/* Task Details */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Task Details</h3>
          {selectedTask ? (
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">{selectedTask.title}</h4>
                <p className="text-gray-600 mb-4">{selectedTask.description}</p>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Event Date</label>
                    <div className="flex items-center text-sm text-gray-900"><Calendar className="w-4 h-4 mr-2 text-gray-400" />{formatDate(selectedTask.eventDate)}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <div className="flex items-center text-sm text-gray-900"><User className="w-4 h-4 mr-2 text-gray-400" />{selectedTask.category.charAt(0).toUpperCase() + selectedTask.category.slice(1)}</div>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Client Requirements</label>
                <div className="bg-gray-50 rounded-xl p-4"><p className="text-sm text-gray-700">{selectedTask.clientRequirements || 'No specific requirements provided.'}</p></div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Update Status</label>
                <div className="space-y-3">
                  {(['assigned', 'in-progress', 'completed'] as const).map((status) => (
                    <button 
                      key={status} 
                      onClick={() => updateTaskStatus(selectedTask.id, status)} 
                      disabled={isUpdating || selectedTask?.status === status}
                      className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-200 ${selectedTask.status === status ? 'border-primary-300 bg-primary-50' : 'border-gray-200 hover:border-primary-200 hover:bg-primary-50'} ${isUpdating && selectedTask.status !== status ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div className="flex items-center">
                        {getStatusIcon(status)}
                        <span className="ml-3 font-medium">
                          {isUpdating && selectedTask.status !== status && (status === selectedTask.status + 1 || (status === 'assigned' && selectedTask.status === 'completed')) // Simple logic for "Updating..."
                            ? 'Updating...' 
                            : status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())
                          }
                        </span>
                        {selectedTask.status === status && <CheckCircle className="w-5 h-5 text-primary-600 ml-auto" />}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-start">
                  <FileText className="w-5 h-5 text-blue-600 mr-3 mt-0.5" />
                  <div>
                    <h5 className="font-medium text-blue-900 mb-1">Progress Updates</h5>
                    <p className="text-sm text-blue-700">Status changes are automatically saved and visible to the event admin.</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4"><FileText className="w-8 h-8 text-gray-400" /></div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">Select a task</h4>
              <p className="text-gray-600">Choose a task from the list to view details and update its status.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VendorDashboard;