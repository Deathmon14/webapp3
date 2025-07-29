// src/components/EditCustomizationOptionForm.tsx

import React, { useState, useEffect } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { CustomizationOption } from '../types';
import { Edit } from 'lucide-react';
import toast from 'react-hot-toast'; // Import toast

interface EditOptionFormProps {
  option: CustomizationOption;
  onUpdate: () => void;
  onCancel: () => void;
}

const EditCustomizationOptionForm: React.FC<EditOptionFormProps> = ({ option, onUpdate, onCancel }) => {
  const [formData, setFormData] = useState({
    name: option.name,
    description: option.description,
    price: option.price.toString(),
    image: option.image,
    category: option.category,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    setFormData({
      name: option.name,
      description: option.description,
      price: option.price.toString(),
      image: option.image,
      category: option.category,
    });
  }, [option]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.category) {
      setMessage('Please fill in all required fields.');
      toast.error('Please fill in all required fields.'); // Replaced alert
      return;
    }
    setLoading(true);
    setMessage('');

    try {
      const optionDocRef = doc(db, 'customizationOptions', option.id);
      await updateDoc(optionDocRef, {
        name: formData.name,
        description: formData.description,
        price: Number(formData.price),
        image: formData.image,
        category: formData.category,
      });

      setMessage('Option updated successfully!');
      toast.success('Option updated successfully!'); // Replaced alert
      onUpdate();
    } catch (error) {
      console.error("Error updating option:", error);
      setMessage('Failed to update option. Please try again.');
      toast.error('Failed to update option. Please try again.'); // Replaced alert
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border border-blue-300 bg-blue-50 rounded-xl p-6 mt-6">
      <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        <Edit className="w-5 h-5 mr-2" />
        Editing: {option.name}
      </h4>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Option Name *</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} className="mt-1 w-full p-2 border rounded-md" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Category *</label>
            <select name="category" value={formData.category} onChange={handleChange} className="mt-1 w-full p-2 border rounded-md" required>
              <option value="venue">Venue</option>
              <option value="catering">Catering</option>
              <option value="decoration">Decoration</option>
              <option value="entertainment">Entertainment</option>
              <option value="photography">Photography</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} className="mt-1 w-full p-2 border rounded-md" rows={2}></textarea>
          </div>
        </div>

        <div className="space-y-4">
           <div>
            <label className="block text-sm font-medium text-gray-700">Price ($) *</label>
            <input type="number" name="price" value={formData.price} onChange={handleChange} className="mt-1 w-full p-2 border rounded-md" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Image URL</label>
            <input type="url" name="image" value={formData.image} onChange={handleChange} className="mt-1 w-full p-2 border rounded-md" placeholder="https://example.com/image.jpg" />
          </div>
        </div>

        <div className="md:col-span-2 flex items-center gap-4">
          <button type="button" onClick={onCancel} className="w-full bg-gray-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-600 transition">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50">
            {loading ? 'Updating...' : 'Update Option'}
          </button>
        </div>
        {message && <p className={`md:col-span-2 mt-2 text-sm text-center ${message.includes('success') ? 'text-green-600' : 'text-red-600'}`}>{message}</p>}
      </form>
    </div>
  );
};

export default EditCustomizationOptionForm;