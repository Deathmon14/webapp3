// src/components/AnalyticsDashboard.tsx

import React, { useMemo } from 'react';
import { BookingRequest, EventPackage, VendorTask, User } from '../types';
import { DollarSign, Package, Users, TrendingUp } from 'lucide-react';

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

  return (
    <div className="space-y-8">
      {/* Revenue Over Time */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 flex items-center mb-4">
          <DollarSign className="w-6 h-6 mr-3 text-green-500" />
          Monthly Revenue
        </h3>
        <div className="space-y-3">
          {Object.entries(analytics.monthlyRevenue).length > 0 ? (
            Object.entries(analytics.monthlyRevenue).map(([month, revenue]) => (
              <div key={month} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                <span className="font-medium text-gray-700">{month}</span>
                <span className="font-bold text-green-600">${revenue.toLocaleString()}</span>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No revenue data available yet.</p>
          )}
        </div>
      </div>

      {/* Package Performance */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 flex items-center mb-4">
          <Package className="w-6 h-6 mr-3 text-blue-500" />
          Package Performance
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-4 font-semibold">Package Name</th>
                <th className="p-4 font-semibold">Bookings</th>
                <th className="p-4 font-semibold">Total Revenue</th>
              </tr>
            </thead>
            <tbody>
              {analytics.sortedPackages.length > 0 ? (
                analytics.sortedPackages.map(([name, data]) => (
                  <tr key={name} className="border-b">
                    <td className="p-4 font-medium text-gray-900">{name}</td>
                    <td className="p-4 text-gray-600">{data.count}</td>
                    <td className="p-4 text-gray-600">${data.revenue.toLocaleString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="text-center p-4 text-gray-500">No package data available.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Vendor Engagement */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 flex items-center mb-4">
          <Users className="w-6 h-6 mr-3 text-purple-500" />
          Vendor Engagement
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-4 font-semibold">Vendor Name</th>
                <th className="p-4 font-semibold">Completed Tasks</th>
              </tr>
            </thead>
            <tbody>
              {analytics.sortedVendors.length > 0 ? (
                analytics.sortedVendors.map((vendor) => (
                  <tr key={vendor.name} className="border-b">
                    <td className="p-4 font-medium text-gray-900">{vendor.name}</td>
                    <td className="p-4 text-gray-600">{vendor.completedTasks}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={2} className="text-center p-4 text-gray-500">No vendor task data available.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
