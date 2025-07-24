// src/components/VendorInsights.tsx

import React from 'react';
import { User, Review, VendorTask, BookingRequest } from '../types';
import { Star, CheckCircle, BarChart2 } from 'lucide-react';

interface VendorInsightsProps {
  vendors: User[];
  reviews: Review[];
  tasks: VendorTask[];
  bookings: BookingRequest[]; // 1. Accept the bookings prop
}

const VendorInsights: React.FC<VendorInsightsProps> = ({ vendors, reviews, tasks, bookings }) => {
  const getVendorStats = (vendorId: string) => {
    // 2. --- CORRECTED LOGIC ---
    const vendorTasks = tasks.filter(task => task.vendorId === vendorId);
    const bookingIdsWorkedOn = [...new Set(vendorTasks.map(task => task.bookingId))];
    
    // Find the packages associated with the bookings the vendor worked on
    const packageIdsWorkedOn = bookings
      .filter(booking => bookingIdsWorkedOn.includes(booking.id))
      .map(booking => booking.packageId);

    const relevantReviews = reviews.filter(review => packageIdsWorkedOn.includes(review.packageId));
    // --- END OF CORRECTION ---

    const averageRating = relevantReviews.length > 0
      ? relevantReviews.reduce((acc, review) => acc + review.rating, 0) / relevantReviews.length
      : 0;

    const completedTasks = vendorTasks.filter(task => task.status === 'completed').length;

    return {
      averageRating: averageRating.toFixed(1),
      ratingCount: relevantReviews.length,
      completedTasks,
    };
  };

  if (vendors.length === 0) {
    return (
      <div className="text-center p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600">No vendors available to display insights.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
       <h4 className="text-lg font-semibold text-gray-800 flex items-center mb-3">
            <BarChart2 className="w-5 h-5 mr-2 text-purple-600" />
            Vendor Performance Insights
        </h4>
      {vendors.map(vendor => {
        const stats = getVendorStats(vendor.uid);
        return (
          <div key={vendor.uid} className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <p className="font-semibold text-gray-900">{vendor.name}</p>
            <div className="flex items-center justify-between text-sm text-gray-600 mt-2">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-500" />
                <span><b>{stats.averageRating}</b> ({stats.ratingCount} reviews)</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span><b>{stats.completedTasks}</b> tasks done</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default VendorInsights;