// src/components/CatalogManager.tsx

import React, { useState } from 'react';
import { EventPackage, CustomizationOption } from '../types';
import AddPackageForm from './AddPackageForm';
import PackageList from './PackageList';
import EditPackageForm from './EditPackageForm';
import AddCustomizationOptionForm from './AddCustomizationOptionForm';
import CustomizationOptionList from './CustomizationOptionList';
import EditCustomizationOptionForm from './EditCustomizationOptionForm';

const CatalogManager: React.FC = () => {
  const [editingPackage, setEditingPackage] = useState<EventPackage | null>(null);
  const [editingOption, setEditingOption] = useState<CustomizationOption | null>(null);

  const handleEditPackage = (pkg: EventPackage) => {
    setEditingPackage(pkg);
    setEditingOption(null);
  };

  const handleEditOption = (option: CustomizationOption) => {
    setEditingOption(option);
    setEditingPackage(null);
  };

  const handleCancel = () => {
    setEditingPackage(null);
    setEditingOption(null);
  };

  const handleUpdate = () => {
    setEditingPackage(null);
    setEditingOption(null);
  };

  return (
    <div className="mt-8 bg-white rounded-2xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-2">Catalog Management</h3>
      
      {/* --- Package Management --- */}
      <div className="mt-6">
        <h4 className="text-lg font-semibold text-gray-800">Event Packages</h4>
        {editingPackage ? (
          <EditPackageForm pkg={editingPackage} onUpdate={handleUpdate} onCancel={handleCancel} />
        ) : (
          !editingOption && <AddPackageForm />
        )}
        <PackageList onEdit={handleEditPackage} />
      </div>

      {/* --- Customization Options Management --- */}
      <div className="mt-10 border-t pt-6">
        <h4 className="text-lg font-semibold text-gray-800">Customization Options</h4>
        {editingOption ? (
          <EditCustomizationOptionForm option={editingOption} onUpdate={handleUpdate} onCancel={handleCancel} />
        ) : (
          !editingPackage && <AddCustomizationOptionForm />
        )}
        <CustomizationOptionList onEdit={handleEditOption} />
      </div>
    </div>
  );
};

export default CatalogManager;