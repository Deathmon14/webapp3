// src/components/CustomizationOptionList.tsx

import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { CustomizationOption } from '../types';
import { Trash2, Edit } from 'lucide-react';

interface CustomizationOptionListProps {
  onEdit: (option: CustomizationOption) => void;
}

const CustomizationOptionList: React.FC<CustomizationOptionListProps> = ({ onEdit }) => {
  const [options, setOptions] = useState<CustomizationOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'customizationOptions'), (snapshot) => {
      const optionsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CustomizationOption));
      setOptions(optionsData);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const handleDelete = async (optionId: string) => {
    if (window.confirm('Are you sure you want to delete this option?')) {
      try {
        await deleteDoc(doc(db, 'customizationOptions', optionId));
        alert('Option deleted successfully.');
      } catch (err) {
        alert('Failed to delete option.');
      }
    }
  };

  if (loading) {
    return <p className="text-center text-gray-500 mt-4">Loading options...</p>;
  }

  return (
    <div className="border-t border-gray-200 mt-8 pt-6">
      <h4 className="text-lg font-semibold text-gray-800 mb-4">Existing Options</h4>
      <div className="space-y-4">
        {options.length > 0 ? (
          options.map(opt => (
            <div key={opt.id} className="bg-gray-50 rounded-lg p-4 flex items-center justify-between hover:bg-gray-100 transition">
              <div>
                <p className="font-semibold text-gray-900">{opt.name} <span className="text-xs text-gray-500 capitalize">({opt.category})</span></p>
                <p className="text-sm text-gray-600">${opt.price.toLocaleString()}</p>
              </div>
              <div className="flex items-center space-x-3">
                <button onClick={() => onEdit(opt)} className="text-gray-500 hover:text-blue-600" title="Edit">
                  <Edit className="w-5 h-5" />
                </button>
                <button onClick={() => handleDelete(opt.id)} className="text-gray-500 hover:text-red-600" title="Delete">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500">No customization options found.</p>
        )}
      </div>
    </div>
  );
};

export default CustomizationOptionList;