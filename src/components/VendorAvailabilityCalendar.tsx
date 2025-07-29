import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import toast from 'react-hot-toast';
import { Calendar as CalendarIcon, Save } from 'lucide-react'; // Import icons

interface Props {
  vendorId: string;
}

export const VendorAvailabilityCalendar: React.FC<Props> = ({ vendorId }) => {
  const [blockedDates, setBlockedDates] = useState<string[]>([]);
  const [selectedDates, setSelectedDates] = useState<string[]>([]); // Renamed to selectedDates for clarity
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!vendorId) return; // Ensure vendorId is available

    const fetchBlockedDates = async () => {
      setLoading(true);
      try {
        const docRef = doc(db, 'vendors', vendorId, 'availability', 'unavailableDates');
        const snap = await getDoc(docRef);
        const datesFromFirestore = snap.exists() ? (snap.data().dates as string[] || []) : [];
        setBlockedDates(datesFromFirestore);
        setSelectedDates(datesFromFirestore); // Initialize selected dates with fetched ones
      } catch (error) {
        console.error("Error fetching vendor blocked dates:", error);
        toast.error("Failed to load your availability.");
      } finally {
        setLoading(false);
      }
    };
    fetchBlockedDates();
  }, [vendorId]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const docRef = doc(db, 'vendors', vendorId, 'availability', 'unavailableDates');
      await setDoc(
        docRef,
        { dates: selectedDates.sort() }, // Sort dates for consistency
        { merge: true } // Use merge to avoid overwriting other fields if they exist
      );
      setBlockedDates(selectedDates.sort()); // Update the official blocked dates after save
      toast.success('Availability saved successfully!');
    } catch (error) {
      console.error("Error saving availability:", error);
      toast.error('Failed to save availability.');
    } finally {
      setLoading(false);
    }
  };

  const toggleDate = (date: string) => {
    setSelectedDates((prev) => {
      const newDates = prev.includes(date)
        ? prev.filter((d) => d !== date)
        : [...prev, date];
      return newDates.sort(); // Keep dates sorted
    });
  };

  const today = new Date();
  today.setDate(today.getDate()); // Set to current date
  const minDate = today.toISOString().split('T')[0]; // Format to YYYY-MM-DD

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-card text-center text-neutral-600">
        Loading availability calendar...
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-card border border-neutral-200">
      <h3 className="text-xl font-bold text-neutral-900 mb-4 flex items-center">
        <CalendarIcon className="w-6 h-6 mr-3 text-primary-600" />
        Manage Unavailable Dates
      </h3>

      <div className="mb-4">
        <label htmlFor="date-picker" className="block text-sm font-medium text-neutral-700 mb-2">
          Select dates to block or unblock:
        </label>
        <input
          id="date-picker"
          type="date"
          min={minDate}
          onChange={(e) => toggleDate(e.target.value)}
          className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 transition-colors"
        />
        <p className="text-xs text-neutral-500 mt-1">Click a date to add/remove it from your unavailable list.</p>
      </div>

      {selectedDates.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-neutral-700 mb-2">Currently Blocked Dates:</h4>
          <div className="flex flex-wrap gap-2">
            {selectedDates.map((d) => (
              <span
                key={d}
                className="bg-danger-100 text-danger-700 px-3 py-1 rounded-full text-sm font-medium flex items-center"
              >
                {d}
                <button
                  onClick={() => toggleDate(d)}
                  className="ml-1 text-danger-600 hover:text-danger-800 focus:outline-none"
                  aria-label={`Remove ${d}`}
                >
                  &times;
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={handleSave}
        className="btn-primary w-full flex items-center justify-center gap-2"
        disabled={loading}
      >
        {loading ? 'Saving...' : <><Save className="w-5 h-5" /> Save Availability</>}
      </button>
    </div>
  );
};
