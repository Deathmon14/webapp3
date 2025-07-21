// src/components/CatalogManager.tsx

import React, { useState } from 'react';
import AddPackageForm from './AddPackageForm';
import PackageList from './PackageList';
import EditPackageForm from './EditPackageForm'; // Import the new component
import { EventPackage } from '../types'; // Import the type

const CatalogManager: React.FC = () => {
  // State to hold the package currently being edited
  const [editingPackage, setEditingPackage] = useState<EventPackage | null>(null);

  const handleEdit = (pkg: EventPackage) => {
    setEditingPackage(pkg);
  };

  const handleCancelEdit = () => {
    setEditingPackage(null);
  };

  const handleUpdate = () => {
    setEditingPackage(null); // Close the form after a successful update
  };

  return (
    <div className="mt-8 bg-white rounded-2xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-6">Catalog Management</h3>
      <p className="text-gray-600 mb-4">
        Add, edit, or remove event packages that are available for clients to book.
      </p>
      
      {/* Conditionally render Add or Edit form */}
      {editingPackage ? (
        <EditPackageForm 
          pkg={editingPackage} 
          onUpdate={handleUpdate} 
          onCancel={handleCancelEdit} 
        />
      ) : (
        <AddPackageForm />
      )}
      
      {/* Pass the handleEdit function to the PackageList */}
      <PackageList onEdit={handleEdit} />
    </div>
  );
};

export default CatalogManager;