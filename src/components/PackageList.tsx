// src/components/PackageList.tsx

import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { EventPackage } from '../types';
import { Trash2, Edit } from 'lucide-react';

// Add onEdit to the props interface
interface PackageListProps {
  onEdit: (pkg: EventPackage) => void;
}

const PackageList: React.FC<PackageListProps> = ({ onEdit }) => {
  const [packages, setPackages] = useState<EventPackage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'packages'), (snapshot) => {
      const packagesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as EventPackage));
      setPackages(packagesData);
      setLoading(false);
    }, (err) => {
      console.error("Error fetching packages:", err);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const handleDelete = async (packageId: string) => {
    if (window.confirm('Are you sure you want to delete this package?')) {
      try {
        await deleteDoc(doc(db, 'packages', packageId));
        alert('Package deleted successfully.');
      } catch (err) {
        console.error("Error deleting package:", err);
        alert('Failed to delete package.');
      }
    }
  };

  if (loading) {
    return <p className="text-center text-gray-500 mt-4">Loading packages...</p>;
  }

  return (
    <div className="border-t border-gray-200 mt-8 pt-6">
      <h4 className="text-lg font-semibold text-gray-800 mb-4">Existing Packages</h4>
      <div className="space-y-4">
        {packages.length > 0 ? (
          packages.map(pkg => (
            <div key={pkg.id} className="bg-gray-50 rounded-lg p-4 flex items-center justify-between hover:bg-gray-100 transition">
              <div>
                <p className="font-semibold text-gray-900">{pkg.name}</p>
                <p className="text-sm text-gray-600">${pkg.basePrice.toLocaleString()}</p>
              </div>
              <div className="flex items-center space-x-3">
                {/* Updated button with onClick handler */}
                <button onClick={() => onEdit(pkg)} className="text-gray-500 hover:text-blue-600" title="Edit">
                  <Edit className="w-5 h-5" />
                </button>
                <button onClick={() => handleDelete(pkg.id)} className="text-gray-500 hover:text-red-600" title="Delete">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500">No event packages found.</p>
        )}
      </div>
    </div>
  );
};

export default PackageList;