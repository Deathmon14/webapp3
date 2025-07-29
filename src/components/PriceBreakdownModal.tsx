import React from 'react';
import { X } from 'lucide-react';

interface BreakdownItem {
  name: string;
  price: number;
  category: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  basePrice: number;
  customizations: BreakdownItem[];
  guestCount: number;
  total: number;
}

export const PriceBreakdownModal: React.FC<Props> = ({
  isOpen,
  onClose,
  basePrice,
  customizations,
  guestCount,
  total,
}) => {
  if (!isOpen) return null;

  const formatPrice = (price: number) => `$${price.toLocaleString()}`;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h3 className="text-xl font-bold text-neutral-900">Price Breakdown</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-neutral-100 transition"
          >
            <X className="w-5 h-5 text-neutral-600" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Base Package */}
          <div className="flex justify-between items-center">
            <span className="text-neutral-700">Base Package</span>
            <span className="font-semibold">{formatPrice(basePrice)}</span>
          </div>

          {/* Customizations */}
          {customizations.length > 0 && (
            <>
              <hr className="my-2" />
              <h4 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide">
                Customizations
              </h4>
              {customizations.map((c) => (
                <div key={c.name} className="flex justify-between text-sm">
                  <span className="text-neutral-600">
                    {c.name}
                    {c.category === 'catering' && ` (${guestCount} guests)`}
                  </span>
                  <span className="font-medium">
                    {formatPrice(
                      c.category === 'catering'
                        ? c.price * guestCount
                        : c.price
                    )}
                  </span>
                </div>
              ))}
            </>
          )}

          {/* Total */}
          <hr className="my-4" />
          <div className="flex justify-between items-center text-lg font-bold">
            <span>Total</span>
            <span className="text-primary-600">{formatPrice(total)}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t">
          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-primary-600 to-secondary-600 text-white py-3 rounded-xl font-semibold"
          >
            Confirm & Proceed
          </button>
        </div>
      </div>
    </div>
  );
};