// src/components/VendorInsights.tsx

import React from 'react';
import { User, Review, VendorTask } from '../types';
import { Star, CheckCircle, BarChart2 } from 'lucide-react';

interface VendorInsightsProps {
  vendors: User[];
  reviews: Review[];
  tasks: VendorTask[];
}

const VendorInsights: React.FC<VendorInsightsProps> = ({ vendors, reviews, tasks }) => {
  const getVendorStats = (vendorId: string) => {
    // Find all reviews related to packages this vendor has worked on
    const vendorTasks = tasks.filter(task => task.vendorId === vendorId);
    const packageIdsWorkedOn = [...new Set(vendorTasks.map(task => task.packageId))];
    
    const relevantReviews = reviews.filter(review => packageIdsWorkedOn.includes(review.packageId));

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