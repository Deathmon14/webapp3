// src/components/AdminDashboard.tsx

import React, { useState, useEffect, useMemo } from 'react';
import { collection, onSnapshot, query, where, doc, updateDoc, addDoc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { db } from '../lib/firebase';
import {
  Calendar, Users, Package, CheckCircle, Clock, AlertCircle, DollarSign, UserCheck, ArrowRight, Settings, XCircle, Search, Download, BarChartHorizontal
} from 'lucide-react';
import { User, BookingRequest, VendorTask, Review, EventPackage } from '../types';
import CatalogManager from './CatalogManager';
import UserManagement from './UserManagement';
import ChatComponent from './ChatComponent';
import VendorInsights from './VendorInsights';
import ActivityLog from './ActivityLog';
import AnalyticsDashboard from './AnalyticsDashboard'; 

interface AdminDashboardProps {
  user: User;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user }) => {
  const [bookings, setBookings] = useState<BookingRequest[]>([]);
  const [vendors, setVendors] = useState<User[]>([]);
  const [tasks, setTasks] = useState<VendorTask[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [packages, setPackages] = useState<EventPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<BookingRequest | null>(null);
  const [activeTab, setActiveTab] = useState<'bookings' | 'users' | 'catalog' | 'analytics'>('bookings');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | BookingRequest['status']>('all');

  useEffect(() => {
    const unsubBookings = onSnapshot(collection(db, 'bookings'), (snapshot) => {
        const bookingsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BookingRequest));
        setBookings(bookingsData.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)));
        setLoading(false);
      });

      const vendorQuery = query(collection(db, 'users'), where('role', '==', 'vendor'));
      const unsubVendors = onSnapshot(vendorQuery, (snapshot) => {
        const vendorsData = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as unknown as User));
        setVendors(vendorsData);
      });

      const unsubTasks = onSnapshot(collection(db, 'tasks'), (snapshot) => {
          const tasksData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as VendorTask));
          setTasks(tasksData);
      });

    const unsubReviews = onSnapshot(collection(db, 'reviews'), (snapshot) => {
      const reviewsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review));
      setReviews(reviewsData);
    });

    const unsubPackages = onSnapshot(collection(db, 'packages'), (snapshot) => {
        const packagesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as EventPackage));
        setPackages(packagesData);
    });

    return () => {
      unsubBookings();
      unsubVendors();
      unsubTasks();
      unsubReviews();
      unsubPackages();
    };
  }, []);

  useEffect(() => {
    if (selectedBooking?.id) {
      const updatedBooking = bookings.find(b => b.id === selectedBooking.id);
      setSelectedBooking(updatedBooking || null);
    }
  }, [bookings, selectedBooking?.id]);

  const filteredBookings = useMemo(() => {
    return bookings.filter(booking => {
      const searchTermLower = searchTerm.toLowerCase();
      const matchesSearch = searchTerm === '' ||
        booking.clientName.toLowerCase().includes(searchTermLower) ||
        booking.packageName.toLowerCase().includes(searchTermLower);

      const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [bookings, searchTerm, statusFilter]);

  const stats = {
    totalBookings: bookings.length,
    pendingBookings: bookings.filter(b => b.status === 'pending').length,
    totalRevenue: bookings
      .filter(b => b.status !== 'rejected')
      .reduce((sum, b) => sum + (b.totalPrice || 0), 0),
    activeVendors: vendors.length
  };

    const handleExportCSV = () => {
        if (filteredBookings.length === 0) {
            alert("No data to export.");
            return;
        }
        const headers = ['Booking ID', 'Client Name', 'Package Name', 'Event Date', 'Status', 'Guest Count', 'Total Price', 'Customizations', 'Requirements'];
        const rows = filteredBookings.map(booking => {
            const customizations = booking.customizations.map(c => c.name).join('; ');
            const requirements = `"${(booking.requirements || '').replace(/"/g, '""')}"`;
            const eventDateFormatted = formatDate(booking.eventDate);
            return [
                booking.id,
                booking.clientName,
                booking.packageName,
                eventDateFormatted,
                booking.status,
                booking.guestCount,
                booking.totalPrice,
                customizations,
                requirements
            ].join(',');
        });
        const csvContent = [headers.join(','), ...rows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `bookings-report-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

  const updateBookingStatus = async (bookingId: string, newStatus: BookingRequest['status']) => {
    if (!bookingId) return;
    const bookingDocRef = doc(db, 'bookings', bookingId);
    try {
      await updateDoc(bookingDocRef, { status: newStatus });
      const booking = bookings.find(b => b.id === bookingId);
      if (booking) {
        const message = `The status of your booking for "${booking.packageName}" has been updated to ${newStatus.replace('-', ' ')}.`;
        await addDoc(collection(db, 'notifications'), {
          userId: booking.clientId, message, isRead: false, createdAt: serverTimestamp(), link: `/booking/${bookingId}`
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
    if (!vendor) return;

    try {
      const batch = writeBatch(db);
      const newTaskRef = doc(collection(db, 'tasks'));
      batch.set(newTaskRef, {
        bookingId: booking.id, vendorId: vendor.uid, vendorName: vendor.name, category,
        title: `${category.charAt(0).toUpperCase() + category.slice(1)} for ${booking.packageName}`,
        description: `Handle ${category} for ${booking.clientName}'s event.`, status: 'assigned', eventDate: booking.eventDate,
        clientRequirements: booking.requirements || 'No specific requirements provided.', createdAt: serverTimestamp(),
      });
      const logRef = doc(collection(db, 'activity_logs'));
      batch.set(logRef, {
        message: `Admin assigned ${vendor.name} to the ${category} task for "${booking.packageName}".`,
        timestamp: serverTimestamp(),
        meta: { bookingId: booking.id, vendorName: vendor.name, clientName: booking.clientName }
      });
      await batch.commit();
      alert(`${vendor.name} has been assigned.`);
    } catch (error) {
      console.error("Error assigning vendor:", error);
      alert("Failed to assign vendor. Please try again.");
    }
  };

  const getRequiredCategories = (booking: BookingRequest | null) => {
    if (!booking || !Array.isArray(booking.customizations) || booking.customizations.length === 0) return [];
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

  if (loading) return <div className="p-8 text-center">Loading Admin Dashboard...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h2>
        <p className="text-gray-600">Oversee bookings, manage users, and configure the event catalog.</p>
      </div>

      <div className="mb-8 border-b border-gray-200">
        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('bookings')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'bookings' ? 'border-purple-500 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            Bookings
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'analytics' ? 'border-purple-500 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            Analytics
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

      {activeTab === 'bookings' && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-gray-600">Total Bookings</p><p className="text-2xl font-bold text-gray-900">{stats.totalBookings}</p></div><div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center"><Calendar className="w-6 h-6 text-purple-600" /></div></div></div>
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-gray-600">Pending</p><p className="text-2xl font-bold text-orange-600">{stats.pendingBookings}</p></div><div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center"><Clock className="w-6 h-6 text-orange-600" /></div></div></div>
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-gray-600">Total Revenue</p><p className="text-2xl font-bold text-green-600">${stats.totalRevenue.toLocaleString()}</p></div><div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center"><DollarSign className="w-6 h-6 text-green-600" /></div></div></div>
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-gray-600">Active Vendors</p><p className="text-2xl font-bold text-blue-600">{stats.activeVendors}</p></div><div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center"><Users className="w-6 h-6 text-blue-600" /></div></div></div>
          </div>
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Recent Bookings</h3>
                  <button onClick={handleExportCSV} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-purple-700 bg-purple-100 rounded-lg hover:bg-purple-200 transition-colors"><Download className="w-4 h-4" />Export CSV</button>
                </div>
                <div className="mb-6 space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input type="text" placeholder="Search by client or package name..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"/>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-gray-600">Status:</span>
                    {(['all', 'pending', 'confirmed', 'in-progress', 'completed', 'rejected'] as const).map((status) => (
                      <button key={status} onClick={() => setStatusFilter(status)} className={`px-3 py-1 rounded-full text-xs font-semibold transition ${statusFilter === status ? 'bg-purple-600 text-white shadow-sm' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
                        {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  {filteredBookings.length > 0 ? filteredBookings.map((booking) => {
                    const assignedCount = tasks.filter(t => t.bookingId === booking.id).length;
                    return (
                      <div key={booking.id} onClick={() => setSelectedBooking(booking)} className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${selectedBooking?.id === booking.id ? 'border-purple-300 bg-purple-50' : 'border-gray-200 hover:border-purple-200'}`}>
                        <div className="flex items-start justify-between mb-3"><div className="flex-1"><div className="flex items-center mb-2"><h4 className="font-semibold text-gray-900 mr-3">{booking.packageName}</h4>{getStatusIcon(booking.status)}</div><p className="text-sm text-gray-600 mb-2">Client: {booking.clientName}</p><div className="flex items-center text-sm text-gray-500"><Calendar className="w-4 h-4 mr-1" /><span>{formatDate(booking.eventDate)}</span></div></div><div className="text-right"><p className="text-lg font-bold text-gray-900">${(booking.totalPrice || 0).toLocaleString()}</p><span className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(booking.status)}`}>{booking.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span></div></div>
                        <div className="flex items-center justify-between pt-3 border-t border-gray-200"><div className="flex items-center text-sm"><UserCheck className="w-4 h-4 mr-1 text-gray-400" /><span className="text-gray-600">Vendors: {assignedCount} assigned</span></div><ArrowRight className="w-4 h-4 text-gray-400" /></div>
                      </div>
                    );
                  }) : <p className="text-gray-500 text-center py-8">No bookings match the current filters.</p>}
                </div>
              </div>
              <ActivityLog />
            </div>
            <div className="space-y-8">
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Booking Management</h3>
                {selectedBooking ? (
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">{selectedBooking.packageName}</h4>
                      <p className="text-sm text-gray-600 mb-3">Client: {selectedBooking.clientName}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">Booking Status</label>
                      <div className="space-y-2">{(['pending', 'confirmed', 'in-progress', 'completed', 'rejected'] as const).map((status) => (<button key={status} onClick={() => updateBookingStatus(selectedBooking.id, status)} className={`w-full p-3 rounded-xl border text-left transition-all ${selectedBooking.status === status ? 'border-purple-300 bg-purple-50 text-purple-700' : 'border-gray-200 hover:border-purple-200 hover:bg-purple-50'}`}><div className="flex items-center">{getStatusIcon(status)}<span className="ml-3 font-medium">{status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span></div></button>))}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">Vendor Assignments</label>
                      <div className="space-y-3">
                        {getRequiredCategories(selectedBooking).length > 0 ? getRequiredCategories(selectedBooking).map((category) => {
                          const assignedTasks = tasks.filter(t => t.bookingId === selectedBooking.id && t.category === category);
                          return (
                            <div key={category} className="border border-gray-200 rounded-xl p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-medium text-gray-900 capitalize">{category}</span>
                                    {assignedTasks.length > 0 && <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">{assignedTasks.length} Assigned</span>}
                                </div>
                                {assignedTasks.map(task => (
                                    <p key={task.id} className="text-sm text-gray-600 mb-1">{task.vendorName}</p>
                                ))}
                                <select 
                                    onChange={(e) => {
                                        assignVendor(selectedBooking, e.target.value, category);
                                        e.target.value = "";
                                    }} 
                                    className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-purple-500 focus:border-purple-500" 
                                    defaultValue=""
                                >
                                    <option value="">Assign a new vendor...</option>
                                    {vendors.map((vendor) => (<option key={vendor.uid} value={vendor.uid}>{vendor.name}</option>))}
                                </select>
                            </div>
                          );
                        }) : <p className="text-sm text-gray-500">No specific vendor services required.</p>}
                      </div>
                    </div>
                    <div className="border-t pt-6">
                      <h4 className="font-semibold text-gray-900 mb-2">Chat with Client</h4>
                      <div className="h-[500px] border border-gray-200 rounded-xl overflow-hidden">
                        <ChatComponent booking={selectedBooking} currentUser={user} />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12"><div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4"><Package className="w-8 h-8 text-gray-400" /></div><h4 className="text-lg font-medium text-gray-900 mb-2">Select a booking</h4><p className="text-gray-600">Choose a booking to manage details, assign vendors, and chat with the client.</p></div>
                )}
              </div>
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <VendorInsights vendors={vendors} reviews={reviews} tasks={tasks} bookings={bookings} />
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'analytics' && (
        <AnalyticsDashboard
          bookings={bookings}
          packages={packages}
          tasks={tasks}
          vendors={vendors}
        />
      )}

      {activeTab === 'users' && <UserManagement />}
      {activeTab === 'catalog' && <CatalogManager />}
    </div>
  );
};

export default AdminDashboard;