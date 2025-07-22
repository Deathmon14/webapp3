// src/components/AddCustomizationOptionForm.tsx

import React, { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { PlusCircle } from 'lucide-react';
import { CustomizationOption } from '../types';

const AddCustomizationOptionForm = () => {
  const [optionName, setOptionName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [category, setCategory] = useState<CustomizationOption['category']>('venue');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!optionName || !price || !category) {
      setMessage('Please fill in all required fields.');
      return;
    }
    setLoading(true);
    setMessage('');

    try {
      await addDoc(collection(db, 'customizationOptions'), {
        name: optionName,
        description,
        price: Number(price),
        image: imageUrl,
        category: category,
      });

      setMessage('New option added successfully!');
      // Reset form
      setOptionName('');
      setDescription('');
      setPrice('');
      setImageUrl('');
      setCategory('venue');
    } catch (error) {
      console.error("Error adding customization option:", error);
      setMessage('Failed to add option. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border border-gray-200 rounded-xl p-6 mt-6">
      <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        <PlusCircle className="w-5 h-5 mr-2" />
        Add Customization Option
      </h4>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Option Name *</label>
            <input type="text" value={optionName} onChange={e => setOptionName(e.target.value)} className="mt-1 w-full p-2 border rounded-md" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Category *</label>
            <select value={category} onChange={e => setCategory(e.target.value as CustomizationOption['category'])} className="mt-1 w-full p-2 border rounded-md" required>
              <option value="venue">Venue</option>
              <option value="catering">Catering</option>
              <option value="decoration">Decoration</option>
              <option value="entertainment">Entertainment</option>
              <option value="photography">Photography</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} className="mt-1 w-full p-2 border rounded-md" rows={2}></textarea>
          </div>
        </div>
        
        <div className="space-y-4">
           <div>
            <label className="block text-sm font-medium text-gray-700">Price ($) *</label>
            <input type="number" value={price} onChange={e => setPrice(e.target.value)} className="mt-1 w-full p-2 border rounded-md" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Image URL</label>
            <input type="url" value={imageUrl} onChange={e => setImageUrl(e.target.value)} className="mt-1 w-full p-2 border rounded-md" placeholder="https://example.com/image.jpg" />
          </div>
        </div>
        
        <div className="md:col-span-2">
          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50">
            {loading ? 'Adding...' : 'Add Option'}
          </button>
          {message && <p className={`mt-4 text-sm text-center ${message.includes('success') ? 'text-green-600' : 'text-red-600'}`}>{message}</p>}
        </div>
      </form>
    </div>
  );
};

export default AddCustomizationOptionForm;