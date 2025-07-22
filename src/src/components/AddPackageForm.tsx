// src/components/AddPackageForm.tsx

import React, { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { PackagePlus } from 'lucide-react';

const AddPackageForm = () => {
  const [packageName, setPackageName] = useState('');
  const [description, setDescription] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [features, setFeatures] = useState('');
  const [isPopular, setIsPopular] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!packageName || !basePrice || !features) {
      setMessage('Please fill in all required fields.');
      return;
    }
    setLoading(true);
    setMessage('');

    try {
      const featuresArray = features.split(',').map(f => f.trim());

      await addDoc(collection(db, 'packages'), {
        name: packageName,
        description,
        basePrice: Number(basePrice),
        image: imageUrl,
        features: featuresArray,
        popular: isPopular,
      });

      setMessage('New package added successfully!');
      // Reset form
      setPackageName('');
      setDescription('');
      setBasePrice('');
      setImageUrl('');
      setFeatures('');
      setIsPopular(false);
    } catch (error) {
      console.error("Error adding package:", error);
      setMessage('Failed to add package. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border border-gray-200 rounded-xl p-6 mt-6">
      <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        <PackagePlus className="w-5 h-5 mr-2" />
        Add New Event Package
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
            <input type="text" value={features} onChange={e => setFeatures(e.target.value)} className="mt-1 w-full p-2 border rounded-md" placeholder="e.g., Floral arrangements, Basic lighting" required />
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
            <input type="url" value={imageUrl} onChange={e => setImageUrl(e.target.value)} className="mt-1 w-full p-2 border rounded-md" placeholder="https://example.com/image.jpg" />
          </div>
          <div className="flex items-center pt-2">
            <input type="checkbox" checked={isPopular} onChange={e => setIsPopular(e.target.checked)} id="isPopular" className="h-4 w-4 rounded" />
            <label htmlFor="isPopular" className="ml-2 block text-sm text-gray-900">Mark as Popular</label>
          </div>
        </div>
        
        {/* Full-width button and message */}
        <div className="md:col-span-2">
          <button type="submit" disabled={loading} className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition disabled:opacity-50">
            {loading ? 'Adding...' : 'Add Package'}
          </button>
          {message && <p className={`mt-4 text-sm text-center ${message.includes('success') ? 'text-green-600' : 'text-red-600'}`}>{message}</p>}
        </div>
      </form>
    </div>
  );
};

export default AddPackageForm;