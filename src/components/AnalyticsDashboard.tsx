import React, { useMemo } from 'react';
import { BookingRequest, EventPackage, VendorTask, User } from '../types';
import { DollarSign, Package, Users } from 'lucide-react';

interface AnalyticsDashboardProps {
  bookings: BookingRequest[];
  packages: EventPackage[];
  tasks: VendorTask[];
  vendors: User[];
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ bookings, packages, tasks, vendors }) => {
  const analytics = useMemo(() => {
    const validBookings = bookings.filter(b => b.status !== 'rejected' && b.status !== 'pending');

    // 1. Revenue Over Time (Monthly)
    const monthlyRevenue: { [key: string]: number } = {};
    validBookings.forEach(booking => {
      const date = booking.createdAt?.seconds ? new Date(booking.createdAt.seconds * 1000) : new Date();
      const month = date.toLocaleString('default', { month: 'long', year: 'numeric' });
      if (!monthlyRevenue[month]) {
        monthlyRevenue[month] = 0;
      }
      monthlyRevenue[month] += booking.totalPrice;
    });

    // 2. Package Performance
    const packagePerformance: { [key: string]: { count: number; revenue: number } } = {};
    validBookings.forEach(booking => {
      if (!packagePerformance[booking.packageName]) {
        packagePerformance[booking.packageName] = { count: 0, revenue: 0 };
      }
      packagePerformance[booking.packageName].count++;
      packagePerformance[booking.packageName].revenue += booking.totalPrice;
    });
    const sortedPackages = Object.entries(packagePerformance).sort(([, a], [, b]) => b.count - a.count);


    // 3. Vendor Engagement
    const vendorEngagement: { [key: string]: { name: string; completedTasks: number } } = {};
    vendors.forEach(v => {
        vendorEngagement[v.uid] = { name: v.name, completedTasks: 0 };
    });
    tasks.forEach(task => {
        if (task.status === 'completed' && vendorEngagement[task.vendorId]) {
            vendorEngagement[task.vendorId].completedTasks++;
        }
    });
    const sortedVendors = Object.values(vendorEngagement).sort((a, b) => b.completedTasks - a.completedTasks);


    return { monthlyRevenue, sortedPackages, sortedVendors };
  }, [bookings, packages, tasks, vendors]);

  const maxPackageRevenue = Math.max(...analytics.sortedPackages.map(([, data]) => data.revenue), 0);
  const maxVendorTasks = Math.max(...analytics.sortedVendors.map(v => v.completedTasks), 0);

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Revenue Card */}
      <div className="card-modern p-6">
        <h3 className="text-xl font-bold text-neutral-900 flex items-center mb-4">
          <DollarSign className="w-6 h-6 mr-3 text-green-500" />
          Monthly Revenue
        </h3>
        <div className="space-y-3">
          {Object.entries(analytics.monthlyRevenue).length > 0 ? (
            Object.entries(analytics.monthlyRevenue).map(([month, revenue]) => (
              <div key={month} className="flex justify-between items-center bg-white/50 p-3 rounded-lg">
                <span className="font-medium text-neutral-700">{month}</span>
                <span className="font-bold text-green-600">${revenue.toLocaleString()}</span>
              </div>
            ))
          ) : (
            <p className="text-neutral-500">No revenue data available yet.</p>
          )}
        </div>
      </div>

      {/* Package Performance with Bar Chart */}
      <div className="card-modern p-6">
        <h3 className="text-xl font-bold text-neutral-900 flex items-center mb-4">
          <Package className="w-6 h-6 mr-3 text-blue-500" />
          Package Performance (by Revenue)
        </h3>
        <div className="space-y-4">
          {analytics.sortedPackages.map(([name, data]) => (
            <div key={name}>
              <div className="flex justify-between items-center text-sm mb-1">
                <span className="font-semibold text-neutral-800">{name} ({data.count} bookings)</span>
                <span className="font-bold text-blue-600">${data.revenue.toLocaleString()}</span>
              </div>
              <div className="w-full bg-white/40 rounded-full h-2.5">
                <div
                  className="bg-blue-500 h-2.5 rounded-full"
                  style={{ width: `${maxPackageRevenue > 0 ? (data.revenue / maxPackageRevenue) * 100 : 0}%`, transition: 'width 0.5s ease-in-out' }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Vendor Engagement with Bar Chart */}
      <div className="card-modern p-6">
        <h3 className="text-xl font-bold text-neutral-900 flex items-center mb-4">
          <Users className="w-6 h-6 mr-3 text-purple-500" />
          Vendor Engagement (by Completed Tasks)
        </h3>
        <div className="space-y-4">
          {analytics.sortedVendors.map((vendor) => (
              <div key={vendor.name}>
              <div className="flex justify-between items-center text-sm mb-1">
                <span className="font-semibold text-neutral-800">{vendor.name}</span>
                <span className="font-bold text-purple-600">{vendor.completedTasks} tasks</span>
              </div>
              <div className="w-full bg-white/40 rounded-full h-2.5">
                <div
                  className="bg-purple-500 h-2.5 rounded-full"
                  style={{ width: `${maxVendorTasks > 0 ? (vendor.completedTasks / maxVendorTasks) * 100 : 0}%`, transition: 'width 0.5s ease-in-out' }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
