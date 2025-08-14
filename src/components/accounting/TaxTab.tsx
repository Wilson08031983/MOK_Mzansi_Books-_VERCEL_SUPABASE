import React from 'react';
import BusinessTaxTab from './BusinessTaxTab';

const TaxTab: React.FC = () => {

  // All tax record handlers moved to BusinessTaxTab component

  // Sample tax records moved to BusinessTaxTab component

  // Status helpers and filtering logic moved to BusinessTaxTab component

  return (
    <div className="space-y-6">
      <BusinessTaxTab />
    </div>
  );
};

export default TaxTab;