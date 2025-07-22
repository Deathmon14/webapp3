import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, where, doc, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import {
  Calendar, Users, Package, CheckCircle, Clock, AlertCircle, DollarSign, UserCheck, ArrowRight, Settings, XCircle, X
} from 'lucide-react';
import { User, BookingRequest, VendorTask } from '../types';
import CatalogManager from './CatalogManager';
import UserManagement from './UserManagement'; // Import the new component

interface AdminDashboardProps {
  user: User; // Assuming 'user' prop is still relevant for potential access control
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user }) => {
  const [bookings, setBookings] = useState<BookingRequest[]>([]);
  // 'allUsers' state is now primarily managed by UserManagement, but 'vendors' is still needed here for assignments
  const [vendors, setVendors] = useState<User[]>([]); 
  const [tasks, setTasks] = useState<VendorTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<BookingRequest | null>(null);
  
  // State for tabs
  const [activeTab, setActiveTab] = useState<'bookings' | 'users' | 'catalog'>('bookings');

  useEffect(() => {
    // Fetch bookings for the 'bookings' tab
    const unsubBookings = onSnapshot(collection(db, 'bookings'), (snapshot) => {
      const bookingsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BookingRequest));
      setBookings(bookingsData.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)));
      // Only set loading to false after initial bookings fetch, as it's the default tab
      setLoading(false); 
    });

    // Fetch vendors specifically for assignment in the 'bookings' tab
    const vendorQuery = query(collection(db, 'users'), where('role', '==', 'vendor'));
    const unsubVendors = onSnapshot(vendorQuery, (snapshot) => {
      const vendorsData = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as unknown as User));
      setVendors(vendorsData);
    });
    
    // Fetch tasks for the 'bookings' tab (to show assigned vendors)
    const unsubTasks = onSnapshot(collection(db, 'tasks'), (snapshot) => {
        const tasksData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as VendorTask));
        setTasks(tasksData);
    });

    return () => {
      unsubBookings();
      unsubVendors();
      unsubTasks();
    };
  }, []);

  // Effect to keep selectedBooking updated if the underlying bookings data changes
  useEffect(() => {
    if (selectedBooking?.id) {
      const updatedBooking = bookings.find(b => b.id === selectedBooking.id);
      setSelectedBooking(updatedBooking || null);
    }
  }, [bookings]);


  const updateBookingStatus = async (bookingId: string, newStatus: BookingRequest['status']) => {
    if (!bookingId) return;
    const bookingDocRef = doc(db, 'bookings', bookingId);
    
    try {
      await updateDoc(bookingDocRef, { status: newStatus });

      const booking = bookings.find(b => b.id === bookingId);
      if (booking) {
        const message = `The status of your booking for "${booking.packageName}" has been updated to ${newStatus.replace('-', ' ')}.`;
        await addDoc(collection(db, 'notifications'), {
          userId: booking.clientId,
          message: message,
          isRead: false,
          createdAt: serverTimestamp(),
          link: `/booking/${bookingId}` // Consider your actual client booking detail route
        });
      }
    } catch (error) {
      console.error("Error updating status or creating notification:", error);
      alert("Failed to update status. Please try again.");
    }
  };
  
  const assignVendor = async (booking: BookingRequest, vendorId: string, category: string) => {
      if (!vendorId || !booking) return;
      const vendor = vendors.find(v => v.uid === vendorId);
      if (!vendor) return; // Ensure vendor exists
      try {
        await addDoc(collection(db, 'tasks'), {
          bookingId: booking.id, vendorId: vendor.uid, vendorName: vendor.name, category,
          title: `${category.charAt(0).toUpperCase() + category.slice(1)} for ${booking.packageName}`,
          description: `Handle ${category} for ${booking.clientName}'s event.`, status: 'assigned', eventDate: booking.eventDate,
          clientRequirements: booking.requirements || 'No specific requirements provided.', createdAt: serverTimestamp(),
        });
        alert(`${vendor.name} has been assigned.`);
      } catch (error) {
        console.error("Error assigning vendor:", error);
        alert("Failed to assign vendor. Please try again.");
      }
    };
  
  const getRequiredCategories = (booking: BookingRequest | null) => {
    if (!booking || !Array.isArray(booking.customizations) || booking.customizations.length === 0) {
      return [];
    }
    return [...new Set(booking.customizations.map(c => c.category))];
  };

  const getStatusIcon = (status: BookingRequest['status']) => {
    switch (status) {
      case 'pending': return <Clock className="w-5 h-5 text-orange-500" />;
      case 'confirmed': return <CheckCircle className="w-5 h-5 text-blue-500" />;
      case 'in-progress': return <Settings className="w-5 h-5 text-purple-500" />;
      case 'completed': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'rejected': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: BookingRequest['status']) => {
    switch (status) {
      case 'pending': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'confirmed': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'in-progress': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'completed': return 'bg-green-100 text-green-700 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const formatDate = (dateString: any) => {
    const date = dateString?.seconds ? new Date(dateString.seconds * 1000) : new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid Date";
    return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };
  
  // Stats now refer to 'bookings' data, and 'activeVendors' from the directly fetched vendors list.
  const stats = { 
    totalBookings: bookings.length, 
    pendingBookings: bookings.filter(b => b.status === 'pending').length, 
    totalRevenue: bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0), 
    activeVendors: vendors.length // Use 'vendors' state here
  };
  
  if (loading) return <div className="p-8 text-center">Loading Admin Dashboard...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* User Role Management Modal (removed as it's now in UserManagement) */}
      {/* The isUserModalOpen, selectedUser, selectedRole, handleRoleUpdate, openUserModal states and functions are no longer needed here */}

      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h2>
        <p className="text-gray-600">Oversee bookings, manage users, and configure the event catalog.</p>
      </div>

      {/* NEW TABS UI */}
      <div className="mb-8 border-b border-gray-200">
        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('bookings')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'bookings' ? 'border-purple-500 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            Bookings
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'users' ? 'border-purple-500 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            User Management
          </button>
          <button
            onClick={() => setActiveTab('catalog')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'catalog' ? 'border-purple-500 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            Catalog Management
          </button>
        </nav>
      </div>

      {/* CONDITIONAL RENDERING BASED ON ACTIVE TAB */}
      {activeTab === 'bookings' && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalBookings}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.pendingBookings}</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-green-600">${stats.totalRevenue.toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Vendors</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.activeVendors}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>
          </div>
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Recent Bookings</h3>
              <div className="space-y-4">
                {bookings.length > 0 ? bookings.map((booking) => {
                  const assignedCount = tasks.filter(t => t.bookingId === booking.id).length;
                  return (
                    <div key={booking.id} onClick={() => setSelectedBooking(booking)} className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${selectedBooking?.id === booking.id ? 'border-purple-300 bg-purple-50' : 'border-gray-200 hover:border-purple-200'}`}>
                       <div className="flex items-start justify-between mb-3">
                         <div className="flex-1">
                           <div className="flex items-center mb-2">
                             <h4 className="font-semibold text-gray-900 mr-3">{booking.packageName}</h4>
                             {getStatusIcon(booking.status)}
                           </div>
                           <p className="text-sm text-gray-600 mb-2">Client: {booking.clientName}</p>
                           <div className="flex items-center text-sm text-gray-500">
                             <Calendar className="w-4 h-4 mr-1" />
                             <span>{formatDate(booking.eventDate)}</span>
                           </div>
                         </div>
                         <div className="text-right">
                           <p className="text-lg font-bold text-gray-900">${(booking.totalPrice || 0).toLocaleString()}</p>
                           <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(booking.status)}`}>
                             {booking.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                           </span>
                         </div>
                       </div>
                        <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                          <div className="flex items-center text-sm">
                            <UserCheck className="w-4 h-4 mr-1 text-gray-400" />
                            <span className="text-gray-600">Vendors: {assignedCount} assigned</span>
                          </div>
                          <ArrowRight className="w-4 h-4 text-gray-400" />
                        </div>
                    </div>
                  );
                }) : <p className="text-gray-500 text-center py-8">No bookings found.</p>}
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Booking Management</h3>
              {selectedBooking ? (
                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">{selectedBooking.packageName}</h4>
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600 mb-3">Client: {selectedBooking.clientName}</p>
                        {/* The "Manage" button is removed as user role management is now in UserManagement tab */}
                        {/* <button onClick={() => openUserModal(selectedBooking.clientId)} className="text-xs text-blue-600 hover:underline">
                            Manage
                        </button> */}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Booking Status</label>
                    <div className="space-y-2">
                      {(['pending', 'confirmed', 'in-progress', 'completed', 'rejected'] as const).map((status) => (
                        <button 
                          key={status} 
                          onClick={() => updateBookingStatus(selectedBooking.id, status)} 
                          className={`w-full p-3 rounded-xl border text-left transition-all ${selectedBooking.status === status ? 'border-purple-300 bg-purple-50 text-purple-700' : 'border-gray-200 hover:border-purple-200 hover:bg-purple-50'}`}
                        >
                          <div className="flex items-center">
                            {getStatusIcon(status)}
                            <span className="ml-3 font-medium">{status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Vendor Assignments</label>
                    <div className="space-y-3">
                      {getRequiredCategories(selectedBooking).length > 0 ? getRequiredCategories(selectedBooking).map((category) => {
                        const assignedTask = tasks.find(t => t.bookingId === selectedBooking.id && t.category === category);
                        return (
                          <div key={category} className="border border-gray-200 rounded-xl p-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-gray-900 capitalize">{category}</span>
                              {assignedTask && <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Assigned</span>}
                            </div>
                            {assignedTask ? (
                              <p className="text-sm text-gray-600">{assignedTask.vendorName}</p>
                            ) : (
                              <select 
                                onChange={(e) => assignVendor(selectedBooking, e.target.value, category)} 
                                className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg text-sm" 
                                defaultValue=""
                              >
                                <option value="">Select vendor...</option>
                                {vendors.map((vendor) => (
                                  <option key={vendor.uid} value={vendor.uid}>{vendor.name}</option>
                                ))}
                              </select>
                            )}
                          </div>
                        );
                      }) : <p className="text-sm text-gray-500">No specific vendor services required for this booking.</p>}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Package className="w-8 h-8 text-gray-400" />
                  </div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">Select a booking</h4>
                  <p className="text-gray-600">Choose a booking from the list to manage details and assign vendors.</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {activeTab === 'users' && <UserManagement user={user} />} {/* Pass the user prop to UserManagement */}

      {activeTab === 'catalog' && <CatalogManager />}

    </div>
  );
};

export default AdminDashboard;