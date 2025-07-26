// src/App.tsx

import React, { useState, useEffect } from 'react';
import { User, Calendar, Package, Settings, LogOut, Menu, X, Bell, ShieldCheck } from 'lucide-react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, collection, query, where, orderBy, onSnapshot, updateDoc } from 'firebase/firestore';
import { auth, db } from './lib/firebase';
import LoginPage from './components/LoginPage';
import ClientDashboard from './components/ClientDashboard';
import VendorDashboard from './components/VendorDashboard';
import AdminDashboard from './components/AdminDashboard';
import { User as UserType, Notification } from './types';

function App() {
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setCurrentUser({
              uid: firebaseUser.uid,
              name: userData.name,
              email: userData.email,
              role: userData.role,
              status: userData.status
            });
          } else {
            console.error('User document not found in Firestore');
            setCurrentUser(null);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (currentUser) {
      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', currentUser.uid),
        orderBy('createdAt', 'desc')
      );

      const unsubscribeNotifications = onSnapshot(q, (snapshot) => {
        const notificationsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Notification));
        setNotifications(notificationsData);
      }, (error) => {
        console.error("Error fetching real-time notifications:", error);
      });

      return () => unsubscribeNotifications();
    }
  }, [currentUser]);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      await updateDoc(notificationRef, { isRead: true });
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      setMobileMenuOpen(false);
      setIsNotificationsOpen(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const getUserIcon = () => {
    switch (currentUser?.role) {
      case 'client':
        return <Package className="w-5 h-5" />;
      case 'vendor':
        return <Settings className="w-5 h-5" />;
      case 'admin':
        return <ShieldCheck className="w-5 h-5" />; // Updated icon for admin
      default:
        return <User className="w-5 h-5" />;
    }
  };

  const renderDashboard = () => {
    if (!currentUser) return null;

    switch (currentUser.role) {
      case 'client':
        return <ClientDashboard user={currentUser} />;
      case 'vendor':
        return <VendorDashboard user={currentUser} />;
      case 'admin':
        return <AdminDashboard user={currentUser} />;
      default:
        return (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">
              Welcome, {currentUser.name}!
            </h2>
            <p className="text-neutral-600">
              Your dashboard is being prepared. Please contact support if this persists.
            </p>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-xl flex items-center justify-center mb-4 mx-auto">
            <Calendar className="w-8 h-8 text-white" />
          </div>
          <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto"></div>
          <p className="text-neutral-600 mt-4">Loading KAISRI...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginPage onLogin={setCurrentUser} />;
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="bg-white/90 backdrop-blur-sm border-b border-neutral-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-lg flex items-center justify-center shadow-md">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                KAISRI
              </h1>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <div className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-neutral-100 text-neutral-700">
                {currentUser && getUserIcon()} {/* Ensure currentUser exists before calling getUserIcon */}
                <span className="text-sm font-medium">
                  {currentUser.name}
                </span>
                <span className="px-2 py-1 text-xs font-semibold bg-primary-100 text-primary-800 rounded-full capitalize">
                  {currentUser.role}
                </span>
              </div>

              <div className="relative">
                <button
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  className="relative p-2 rounded-full hover:bg-neutral-100 transition-colors"
                >
                  <Bell className="w-5 h-5 text-neutral-600" />
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
                  )}
                </button>

                {isNotificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border z-10 max-h-96 overflow-y-auto">
                    <div className="p-4 border-b border-neutral-200">
                      <h4 className="font-semibold text-neutral-800">Notifications</h4>
                    </div>
                    {notifications.length > 0 ? (
                      notifications.map(n => (
                        <div
                          key={n.id}
                          onClick={() => handleMarkAsRead(n.id)}
                          className={`p-4 border-b border-neutral-100 last:border-b-0 hover:bg-neutral-50 cursor-pointer ${!n.isRead ? 'bg-blue-50' : ''}`}
                        >
                          <p className="text-sm text-neutral-700">{n.message}</p>
                          <p className="text-xs text-neutral-400 mt-1">
                            {n.createdAt?.seconds ? new Date(n.createdAt.seconds * 1000).toLocaleString() : 'No date'}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-neutral-500">
                        <p>You have no notifications.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 text-neutral-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm font-medium">Logout</span>
              </button>
            </div>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-neutral-100 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-neutral-200">
              <div className="flex items-center space-x-2 px-3 py-2 mb-3">
                {currentUser && getUserIcon()} {/* Ensure currentUser exists before calling getUserIcon */}
                <span className="text-sm font-medium text-neutral-700">
                  {currentUser.name}
                </span>
                <span className="px-2 py-1 text-xs font-medium bg-primary-100 text-primary-700 rounded-full capitalize">
                  {currentUser.role}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 w-full px-3 py-2 text-neutral-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm font-medium">Logout</span>
              </button>
            </div>
          )}
        </div>
      </header>
      <main className="flex-1">
        {renderDashboard()}
      </main>
    </div>
  );
}

export default App;
