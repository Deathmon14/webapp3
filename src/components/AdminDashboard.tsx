// src/components/AdminDashboard.tsx

import React, { useState, useEffect, useMemo } from 'react';
import { collection, onSnapshot, query, where, doc, updateDoc, addDoc, serverTimestamp, writeBatch, getDoc, orderBy, limit, startAfter, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import {
  LayoutDashboard, Calendar, Users, Package, BarChart2, MessageSquare, Settings, XCircle, Search, Download, CheckCircle, Clock, DollarSign, UserCheck, ArrowRight, Loader // Import Loader
} from 'lucide-react';
import { User, BookingRequest, VendorTask, Review, EventPackage } from '../types';
import CatalogManager from './CatalogManager';
import UserManagement from './UserManagement';
import ChatComponent from './ChatComponent';
import VendorInsights from './VendorInsights';
import ActivityLog from './ActivityLog';
import AnalyticsDashboard from './AnalyticsDashboard';
import toast from 'react-hot-toast';

interface AdminDashboardProps {
  user: User;
}

const PAGE_SIZE = 10; // Define page size for pagination

// Helper component for the new sidebar
const AdminSidebar = ({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (tab: string) => void }) => {
  const navItems = [
    { id: 'bookings', label: 'Bookings', icon: LayoutDashboard },
    { id: 'analytics', label: 'Analytics', icon: BarChart2 },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'catalog', label: 'Catalog', icon: Package },
  ];

  return (
    <div className="bg-white/50 backdrop-blur-lg rounded-2xl p-4 space-y-2">
      {navItems.map(item => (
        <button
          key={item.id}
          onClick={() => setActiveTab(item.id)}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
            activeTab === item.id
              ? 'bg-primary-100 text-primary-800 shadow-inner'
              : 'text-neutral-600 hover:bg-white/70 hover:text-primary-600'
          }`}
        >
          <item.icon className="w-5 h-5" />
          <span>{item.label}</span>
        </button>
      ))}
    </div>
  );
};

// Bookings View with the fix applied
const BookingsView = ({ bookings, tasks, vendors, selectedBooking, setSelectedBooking, reviews, statusFilter, setSearchTerm, setStatusFilter, handleExportCSV, loadMoreBookings, hasMore, isLoadingMore, filteredBookings, stats, updateBookingStatus, assignVendor, getRequiredCategories, getStatusIcon, getStatusColor, formatDate, searchTerm, currentUser, isUpdating }: {
  bookings: BookingRequest[];
  tasks: VendorTask[];
  vendors: User[];
  reviews: Review[]; // Added reviews prop
  selectedBooking: BookingRequest | null;
  setSelectedBooking: (booking: BookingRequest | null) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: 'all' | BookingRequest['status'];
  setStatusFilter: (status: 'all' | BookingRequest['status']) => void;
  isUpdating: string | null; // Added isUpdating prop
  updateBookingStatus: (bookingId: string, newStatus: BookingRequest['status']) => Promise<void>;
  assignVendor: (booking: BookingRequest, vendorId: string, category: string) => Promise<void>;
  getRequiredCategories: (booking: BookingRequest | null) => string[];
  getStatusIcon: (status: BookingRequest['status']) => JSX.Element;
  getStatusColor: (status: BookingRequest['status']) => string;
  formatDate: (dateString: any) => string;
  handleExportCSV: () => void;
  loadMoreBookings: () => Promise<void>;
  hasMore: boolean;
  isLoadingMore: boolean;
  stats: {
    totalBookings: number;
    pendingBookings: number;
    totalRevenue: number;
    activeVendors: number;
  };
  currentUser: User;
}) => {

  const getTaskStatusIcon = (status: VendorTask['status']) => {
    switch (status) {
      case 'assigned': return <Clock className="w-4 h-4 text-orange-600" />;
      case 'in-progress': return <Loader className="w-4 h-4 text-blue-600 animate-spin" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-600" />;
      default: return <Clock className="w-4 h-4 text-neutral-500" />;
    }
  };

  // Memoize filtered bookings to prevent unnecessary re-renders
  const filteredBookingsMemo = useMemo(() => {
    return bookings.filter(booking => {
      const searchTermLower = searchTerm.toLowerCase();
      const matchesSearch = searchTerm === '' ||
        booking.clientName.toLowerCase().includes(searchTermLower) ||
        booking.packageName.toLowerCase().includes(searchTermLower);
      const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [bookings, searchTerm, statusFilter]);

  return (
    <>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-card transition-shadow hover:shadow-card-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">Total Bookings</p>
              <p className="text-2xl font-bold text-neutral-900">{stats.totalBookings}</p>
            </div>
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-primary-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-card transition-shadow hover:shadow-card-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pendingBookings}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-card transition-shadow hover:shadow-card-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">Total Revenue</p>
              <p className="text-2xl font-bold text-green-600">${stats.totalRevenue.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-card transition-shadow hover:shadow-card-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">Active Vendors</p>
              <p className="text-2xl font-bold text-blue-600">{stats.activeVendors}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Main content grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-2xl shadow-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-neutral-900">Recent Bookings</h3>
              <button onClick={handleExportCSV} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary-700 bg-primary-100 rounded-lg hover:bg-primary-200 transition-colors">
                <Download className="w-4 h-4" />Export CSV
              </button>
            </div>
            <div className="mb-6 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search by client or package name..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium text-neutral-600">Status:</span>
                {(['all', 'pending', 'awaiting-payment', 'confirmed', 'in-progress', 'completed', 'rejected'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                      statusFilter === status
                        ? 'bg-primary-100 text-primary-800 ring-2 ring-primary-200'
                        : 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300'
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              {filteredBookingsMemo.length > 0 ? filteredBookingsMemo.map((booking) => {
                const assignedCount = tasks.filter(t => t.bookingId === booking.id).length;
                return (
                  <div
                    key={booking.id}
                    onClick={() => setSelectedBooking(booking)}
                    className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                      selectedBooking?.id === booking.id ? 'border-primary-300 bg-primary-50' : 'border-neutral-200 hover:border-primary-200'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <h4 className="font-semibold text-neutral-900 mr-3">{booking.packageName}</h4>
                          {getStatusIcon(booking.status)}
                        </div>
                        <p className="text-sm text-neutral-600 mb-2">Client: {booking.clientName}</p>
                        <div className="flex items-center text-sm text-neutral-500">
                          <Calendar className="w-4 h-4 mr-1" />
                          <span>{formatDate(booking.eventDate)}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-neutral-900">${(booking.totalPrice || 0).toLocaleString()}</p>
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(booking.status)}`}>
                          {booking.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-neutral-200">
                      <div className="flex items-center text-sm">
                        <UserCheck className="w-4 h-4 mr-1 text-neutral-400" />
                        <span className="text-neutral-600">Vendors: {assignedCount} assigned</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-neutral-400" />
                    </div>
                  </div>
                );
              }) : <p className="text-neutral-500 text-center py-8">No bookings match the current filters.</p>}
            </div>
            {hasMore && (
              <div className="text-center py-4">
                <button onClick={loadMoreBookings} className="btn-primary" disabled={isLoadingMore}>
                  {isLoadingMore ? 'Loading More...' : 'Load More'}
                </button>
              </div>
            )}
          </div>
          <ActivityLog />
        </div>
        <div className="space-y-8">
          <div className="bg-white rounded-2xl shadow-card p-6">
            <h3 className="text-xl font-bold text-neutral-900 mb-6">Booking Management</h3>
            {selectedBooking ? (
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-neutral-900 mb-2">{selectedBooking.packageName}</h4>
                  <p className="text-sm text-neutral-600 mb-3">Client: {selectedBooking.clientName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-3">Booking Status</label>
                  <div className="space-y-2">
                    {(['pending', 'awaiting-payment', 'confirmed', 'in-progress', 'completed', 'rejected'] as const).map((status) => (
                      <button
                        key={status}
                        onClick={() => updateBookingStatus(selectedBooking.id, status)}
                        className={`w-full p-3 rounded-xl border text-left transition-all ${
                          selectedBooking.status === status ? 'border-primary-300 bg-primary-50 text-primary-700' : 'border-neutral-200 hover:border-primary-200 hover:bg-primary-50'
                        } ${isUpdating === selectedBooking.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={isUpdating === selectedBooking.id}
                      >
                        <div className="flex items-center">
                          {getStatusIcon(status)}
                          <span className="ml-3 font-medium">{status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                          {isUpdating === selectedBooking.id && (
                              <span className="ml-2 text-xs text-primary-600">Updating...</span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-3">Vendor Assignments</label>
                  <div className="space-y-3">
                    {getRequiredCategories(selectedBooking).length > 0 ? getRequiredCategories(selectedBooking).map((category) => {
                      const assignedTasks = tasks.filter(t => t.bookingId === selectedBooking.id && t.category === category);
                      return (
                        <div key={category} className="border border-neutral-200 rounded-xl p-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="font-medium text-neutral-900 capitalize">{category}</span>
                                {assignedTasks.length > 0 && (
                                  <div className="flex items-center gap-2 px-2 py-1 bg-neutral-100 text-neutral-700 rounded-full text-xs font-medium">
                                    {getTaskStatusIcon(assignedTasks[0].status)} {/* Assuming one task per category for simplicity */}
                                    <span>{assignedTasks[0].status.replace('-', ' ')}</span>
                                  </div>
                                )}
                            </div>
                            {assignedTasks.map(task => (
                                <p key={task.id} className="text-sm text-neutral-600 mb-1">Assigned to: <span className="font-semibold">{task.vendorName}</span></p>
                            ))}
                            <select
                                onChange={(e) => {
                                    assignVendor(selectedBooking, e.target.value, category);
                                    e.target.value = "";
                                }}
                                className="w-full mt-2 px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-primary-500 focus:border-primary-500"
                                defaultValue=""
                            >
                                <option value="">Assign a vendor...</option>
                                {vendors.map((vendor) => (<option key={vendor.uid} value={vendor.uid}>{vendor.name}</option>))}
                            </select>
                        </div>
                      );
                    }) : <p className="text-sm text-neutral-500">No specific vendor services required.</p>}
                  </div>
                </div>
                <div className="border-t pt-6">
                  <h4 className="font-semibold text-neutral-900 mb-2">Chat with Client</h4>
                  <div className="h-[500px] border border-neutral-200 rounded-xl overflow-hidden">
                    <ChatComponent booking={selectedBooking} currentUser={currentUser} />
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="w-8 h-8 text-neutral-400" />
                </div>
                <h4 className="text-lg font-medium text-neutral-900 mb-2">Select a booking</h4>
                <p className="text-neutral-600">Choose a booking to manage details, assign vendors, and chat with the client.</p>
              </div>
            )}
          </div>
          <div className="bg-white rounded-2xl shadow-card p-6">
            <VendorInsights vendors={vendors} reviews={reviews} tasks={tasks} />
          </div>
        </div>
      </div>
    </>
  );
};

// Main Dashboard Component
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
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  // Pagination states
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    const fetchInitialBookings = async () => {
      setLoading(true);
      try {
        let bookingsQueryRef = query(
          collection(db, 'bookings'),
          orderBy('createdAt', 'desc'),
          limit(PAGE_SIZE)
        );

        if (statusFilter !== 'all') {
          bookingsQueryRef = query(
            collection(db, 'bookings'),
            where('status', '==', statusFilter),
            orderBy('createdAt', 'desc'),
            limit(PAGE_SIZE)
          );
        }

        const snap = await getDocs(bookingsQueryRef);
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as BookingRequest));
        setBookings(data);
        setLastDoc(snap.docs[snap.docs.length - 1] || null);
        setHasMore(snap.docs.length === PAGE_SIZE);
      } catch (error) {
        console.error("Error fetching initial bookings:", error);
        toast.error("Failed to load bookings.");
      } finally {
        setLoading(false);
      }
    };

    fetchInitialBookings();

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
      unsubVendors();
      unsubTasks();
      unsubReviews();
      unsubPackages();
    };
  }, [statusFilter]);

  useEffect(() => {
    if (selectedBooking?.id) {
      const updatedBooking = bookings.find(b => b.id === selectedBooking.id);
      setSelectedBooking(updatedBooking || null);
    }
  }, [bookings, selectedBooking?.id]);

  const loadMoreBookings = async () => {
    if (!lastDoc || !hasMore || isLoadingMore) return;

    setIsLoadingMore(true);
    try {
      let nextQueryRef = query(
        collection(db, 'bookings'),
        orderBy('createdAt', 'desc'),
        startAfter(lastDoc),
        limit(PAGE_SIZE)
      );

      if (statusFilter !== 'all') {
        nextQueryRef = query(
          collection(db, 'bookings'),
          where('status', '==', statusFilter),
          orderBy('createdAt', 'desc'),
          startAfter(lastDoc),
          limit(PAGE_SIZE)
        );
      }

      const snap = await getDocs(nextQueryRef);
      const more = snap.docs.map(d => ({ id: d.id, ...d.data() } as BookingRequest));
      setBookings(prev => [...prev, ...more]);
      setLastDoc(snap.docs[snap.docs.length - 1] || null);
      setHasMore(snap.docs.length === PAGE_SIZE);
    } catch (error) {
      console.error("Error loading more bookings:", error);
      toast.error("Failed to load more bookings.");
    } finally {
      setIsLoadingMore(false);
    }
  };

  const stats = {
    totalBookings: bookings.length,
    pendingBookings: bookings.filter(b => b.status === 'pending').length,
    totalRevenue: bookings
      .filter(b => b.status !== 'rejected')
      .reduce((sum, b) => sum + (b.totalPrice || 0), 0),
    activeVendors: vendors.length
  };

  const handleExportCSV = () => {
    if (bookings.length === 0) {
      toast.error("No data to export.");
      return;
    }
    const headers = ['Booking ID', 'Client Name', 'Package Name', 'Event Date', 'Status', 'Guest Count', 'Total Price', 'Customizations', 'Requirements'];
    const rows = bookings.map(booking => {
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
    setIsUpdating(bookingId);
    const bookingDocRef = doc(db, 'bookings', bookingId);
    try {
      await updateDoc(bookingDocRef, { status: newStatus });

      setBookings(prevBookings =>
        prevBookings.map(b =>
          b.id === bookingId ? { ...b, status: newStatus } : b
        )
      );

      const booking = bookings.find(b => b.id === bookingId);
      if (booking) {
        const message = `The status of your booking for "${booking.packageName}" has been updated to ${newStatus.replace('-', ' ')}.`;
        await addDoc(collection(db, 'notifications'), {
          userId: booking.clientId, message, isRead: false, createdAt: serverTimestamp(), link: `/booking/${bookingId}`
        });
        toast.success(`Booking status updated to ${newStatus.replace('-', ' ')}.`);
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status.");
    } finally {
      setIsUpdating(null);
    }
  };

  const getVendorUnavailableDates = async (vendorId: string): Promise<string[]> => {
    try {
      const docSnap = await getDoc(doc(db, 'vendors', vendorId, 'availability', 'unavailableDates'));
      return docSnap.exists() ? docSnap.data().dates || [] : [];
    } catch (error) {
      console.error("Error fetching vendor unavailable dates:", error);
      return [];
    }
  };

  const assignVendor = async (booking: BookingRequest, vendorId: string, category: string) => {
    if (!vendorId || !booking) return;
    const vendor = vendors.find(v => v.uid === vendorId);
    if (!vendor) return;

    const isAlreadyAssigned = tasks.some(
      t => t.bookingId === booking.id && t.category === category
    );

    if (isAlreadyAssigned) {
      toast.error(`A vendor is already assigned to the ${category} category for this booking.`);
      return;
    }

    const vendorUnavailable = await getVendorUnavailableDates(vendorId);
    const bookingEventDate = formatDate(booking.eventDate);
    const isBlocked = vendorUnavailable.includes(bookingEventDate);

    if (isBlocked) {
      toast.error(`${vendor.name} is unavailable on ${bookingEventDate}. Please choose another vendor.`);
      return;
    }

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
      toast.success(`${vendor.name} has been assigned.`);
    } catch (error) {
      console.error("Error assigning vendor:", error);
      toast.error("Failed to assign vendor. Please try again.");
    }
  };

  const getRequiredCategories = (booking: BookingRequest | null) => {
    if (!booking || !Array.isArray(booking.customizations) || booking.customizations.length === 0) return [];
    return [...new Set(booking.customizations.map(c => c.category))];
  };

  const getStatusIcon = (status: BookingRequest['status']) => {
    switch (status) {
      case 'pending': return <Clock className="w-5 h-5 text-orange-500" />;
      case 'awaiting-payment': return <DollarSign className="w-5 h-5 text-yellow-500" />;
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
      case 'awaiting-payment': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
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
    return date.toISOString().split('T')[0];
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'bookings':
        return (
          <BookingsView
            bookings={bookings}
            tasks={tasks}
            vendors={vendors}
            selectedBooking={selectedBooking}
            setSelectedBooking={setSelectedBooking}
            reviews={reviews}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            isUpdating={isUpdating} // Pass isUpdating state
            updateBookingStatus={updateBookingStatus} // Pass handler
            assignVendor={assignVendor} // Pass handler
            getRequiredCategories={getRequiredCategories}
            getStatusIcon={getStatusIcon}
            getStatusColor={getStatusColor}
            formatDate={formatDate}
            handleExportCSV={handleExportCSV}
            loadMoreBookings={loadMoreBookings}
            hasMore={hasMore}
            isLoadingMore={isLoadingMore}
            stats={stats}
            currentUser={user}
          />
        );
      case 'analytics':
        return <AnalyticsDashboard bookings={bookings} packages={packages} tasks={tasks} vendors={vendors} />;
      case 'users':
        return <UserManagement />;
      case 'catalog':
        return <CatalogManager />;
      default:
        return null;
    }
  };

  if (loading) return <div className="p-8 text-center">Loading Admin Dashboard...</div>;

  return (
    <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h2 className="text-4xl font-bold text-neutral-900 mb-2">Admin Dashboard</h2>
        <p className="text-lg text-neutral-600">Oversee bookings, manage users, and configure the event catalog.</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        <div className="lg:col-span-1 sticky top-24">
          <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
        <div className="lg:col-span-3">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
