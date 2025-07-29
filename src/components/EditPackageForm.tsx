// src/components/EditPackageForm.tsx

import React, { useState, useEffect } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { EventPackage } from '../types';
import { Edit } from 'lucide-react';
import toast from 'react-hot-toast'; // Import toast

interface EditPackageFormProps {
  pkg: EventPackage;
  onUpdate: () => void;
  onCancel: () => void;
}

const EditPackageForm: React.FC<EditPackageFormProps> = ({ pkg, onUpdate, onCancel }) => {
  const [packageName, setPackageName] = useState(pkg.name);
  const [description, setDescription] = useState(pkg.description);
  const [basePrice, setBasePrice] = useState(pkg.basePrice.toString());
  const [imageUrl, setImageUrl] = useState(pkg.image);
  const [features, setFeatures] = useState(pkg.features.join(', '));
  const [isPopular, setIsPopular] = useState(pkg.popular || false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    setPackageName(pkg.name);
    setDescription(pkg.description);
    setBasePrice(pkg.basePrice.toString());
    setImageUrl(pkg.image);
    setFeatures(pkg.features.join(', '));
    setIsPopular(pkg.popular || false);
  }, [pkg]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!packageName || !basePrice || !features) {
      setMessage('Please fill in all required fields.');
      toast.error('Please fill in all required fields.'); // Replaced alert
      return;
    }
    setLoading(true);
    setMessage('');

    try {
      const packageDocRef = doc(db, 'packages', pkg.id);
      const featuresArray = features.split(',').map(f => f.trim());

      await updateDoc(packageDocRef, {
        name: packageName,
        description,
        basePrice: Number(basePrice),
        image: imageUrl,
        features: featuresArray,
        popular: isPopular,
      });

      setMessage('Package updated successfully!');
      toast.success('Package updated successfully!'); // Replaced alert
      onUpdate();
    } catch (error) {
      console.error("Error updating package:", error);
      setMessage('Failed to update package. Please try again.');
      toast.error('Failed to update package. Please try again.'); // Replaced alert
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border border-blue-300 bg-blue-50 rounded-xl p-6 mt-6">
      <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        <Edit className="w-5 h-5 mr-2" />
        Editing: {pkg.name}
      </h4>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Column 1 */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Package Name *</label>
            <input type="text" value={packageName} onChange={e => setPackageName(e.target.value)} className="mt-1 w-full p-2 border rounded-md" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} className="mt-1 w-full p-2 border rounded-md" rows={3}></textarea>
          </div>
           <div>
            <label className="block text-sm font-medium text-gray-700">Features (comma-separated) *</label>
            <input type="text" value={features} onChange={e => setFeatures(e.target.value)} className="mt-1 w-full p-2 border rounded-md" required />
          </div>
        </div>

        {/* Column 2 */}
        <div className="space-y-4">
           <div>
            <label className="block text-sm font-medium text-gray-700">Base Price *</label>
            <input type="number" value={basePrice} onChange={e => setBasePrice(e.target.value)} className="mt-1 w-full p-2 border rounded-md" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Image URL</label>
            <input type="url" value={imageUrl} onChange={e => setImageUrl(e.target.value)} className="mt-1 w-full p-2 border rounded-md" />
          </div>
          <div className="flex items-center pt-2">
            <input type="checkbox" checked={isPopular} onChange={e => setIsPopular(e.target.checked)} id="isPopularEdit" className="h-4 w-4 rounded" />
            <label htmlFor="isPopularEdit" className="ml-2 block text-sm text-gray-900">Mark as Popular</label>
          </div>
        </div>

        {/* Full-width buttons and message */}
        <div className="md:col-span-2 flex items-center gap-4">
          <button type="button" onClick={onCancel} className="w-full bg-gray-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-600 transition">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50">
            {loading ? 'Updating...' : 'Update Package'}
          </button>
        </div>
        {message && <p className={`mt-2 text-sm text-center ${message.includes('success') ? 'text-green-600' : 'text-red-600'}`}>{message}</p>}
      </form>
    </div>
  );
};

export default EditPackageForm;