import React from 'react';
import { Package, Heart, Calendar, PlusCircle } from 'lucide-react';

type Variant = 'packages' | 'wishlist' | 'bookings';

interface Props {
  variant: Variant;
  onAction?: () => void;
}

const config = {
  packages: {
    icon: <Package className="w-12 h-12 text-neutral-400" />,
    title: 'No packages found',
    subtitle: 'Try adjusting your filters or save some packages!',
    actionLabel: 'Browse All',
    actionIcon: <PlusCircle className="w-4 h-4 inline ml-1" />,
  },
  wishlist: {
    icon: <Heart className="w-12 h-12 text-red-400" />,
    title: 'Your wishlist is empty',
    subtitle: 'Save packages you love to compare later.',
    actionLabel: 'Discover Packages',
    actionIcon: <PlusCircle className="w-4 h-4 inline ml-1" />,
  },
  bookings: {
    icon: <Calendar className="w-12 h-12 text-neutral-400" />,
    title: 'No bookings yet',
    subtitle: 'Start planning your next celebration.',
    actionLabel: 'Browse Packages',
    actionIcon: <PlusCircle className="w-4 h-4 inline ml-1" />,
  },
};

export const EmptyState: React.FC<Props> = ({ variant, onAction }) => {
  const { icon, title, subtitle, actionLabel, actionIcon } = config[variant];

  return (
    <div className="text-center py-16 px-4 bg-white rounded-2xl shadow-sm border border-neutral-200">
      <div className="flex justify-center mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-neutral-900 mb-2">{title}</h3>
      <p className="text-neutral-600 mb-6 max-w-sm mx-auto">{subtitle}</p>
      {onAction && (
        <button
          onClick={onAction}
          className="btn-primary inline-flex items-center"
        >
          {actionLabel}
          {actionIcon}
        </button>
      )}
    </div>
  );
};