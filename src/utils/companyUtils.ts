/**
 * Company Utilities
 * 
 * This module provides utility functions for working with company data,
 * including formatting addresses, banking details, and company assets.
 */

import * as localStorageService from '../services/localStorageService';

// Company details interface
export interface CompanyDetails {
  name: string;
  email: string;
  phone: string;
  addressLine1?: string;
  addressLine2?: string;
  addressLine3?: string;
  addressLine4?: string;
  vatNumber?: string;
  regNumber?: string;
  csdNumber?: string;
  bankName?: string;
  accountNumber?: string;
  branchCode?: string;
  accountType?: string;
  website?: string;
  contactName?: string;
  contactSurname?: string;
  position?: string;
  vatNotApplicable?: boolean;
  websiteNotApplicable?: boolean;
  csdNotApplicable?: boolean;
}

// Company assets interface
export interface CompanyAssets {
  logo?: string;
  stamp?: string;
  signature?: string;
}

/**
 * Get company details from localStorage
 * @returns Company details object
 */
export const getCompanyDetails = (): CompanyDetails => {
  const defaultCompany: CompanyDetails = {
    name: 'MOK Mzansi Books',
    email: 'admin@mokmzansibooks.com',
    phone: '+27 11 123 4567',
    addressLine1: '123 Business Street',
    addressLine2: 'Atteridgeville',
    addressLine3: 'Pretoria',
    addressLine4: 'Gauteng, 2000',
    vatNumber: '4230142398',
    regNumber: 'CK2021/123456/07',
    bankName: 'First National Bank',
    accountNumber: '62123456789',
    branchCode: '250655',
    accountType: 'Business Account'
  };
  
  return localStorageService.getItem<CompanyDetails>('companyDetails', defaultCompany);
};

/**
 * Get company assets from localStorage
 * @returns Company assets object
 */
export const getCompanyAssets = (): CompanyAssets => {
  return localStorageService.getItem<CompanyAssets>('companyAssets', {});
};

/**
 * Format company address
 * @param company The company details object
 * @returns Formatted address string
 */
export const formatAddress = (company: CompanyDetails): string => {
  if (!company) return '';
  
  const addressLines = [
    company.addressLine1,
    company.addressLine2,
    company.addressLine3,
    company.addressLine4
  ].filter(Boolean);
  
  return addressLines.join('\n');
};

/**
 * Format company banking details
 * @param company The company details object
 * @returns Formatted banking details string
 */
export const formatBankingDetails = (company: CompanyDetails): string => {
  if (!company) return '';
  
  const parts = [];
  
  if (company.bankName) {
    parts.push(`Bank: ${company.bankName}`);
  }
  
  if (company.accountNumber) {
    parts.push(`Account: ${company.accountNumber}`);
  }
  
  if (company.branchCode) {
    parts.push(`Branch Code: ${company.branchCode}`);
  }
  
  if (company.accountType) {
    parts.push(`Type: ${company.accountType}`);
  }
  
  return parts.join('\n');
};

/**
 * Get company contact information
 * @param company The company details object
 * @returns Object with email, phone, and website properties
 */
export const getContactInfo = (company: CompanyDetails): { 
  email: string; 
  phone: string; 
  website: string;
} => {
  if (!company) return { email: '', phone: '', website: '' };
  
  const email = company.email || '';
  const phone = company.phone || '';
  const website = company.websiteNotApplicable ? '' : (company.website || '');
  
  return { email, phone, website };
};

/**
 * Format company data for PDF generation
 * @returns Formatted company data for PDF
 */
export const formatCompanyForPdf = (): {
  name: string;
  email: string;
  phone: string;
  address: string;
  vatNumber: string;
  regNumber: string;
  bankingDetails: string;
  logo?: string;
  stamp?: string;
  signature?: string;
} => {
  const company = getCompanyDetails();
  const assets = getCompanyAssets();
  
  if (!company) {
    return {
      name: '',
      email: '',
      phone: '',
      address: '',
      vatNumber: '',
      regNumber: '',
      bankingDetails: ''
    };
  }
  
  const address = formatAddress(company);
  const bankingDetails = formatBankingDetails(company);
  const contactInfo = getContactInfo(company);
  
  return {
    name: company.name,
    email: contactInfo.email,
    phone: contactInfo.phone,
    address,
    vatNumber: company.vatNotApplicable ? 'N/A' : (company.vatNumber || ''),
    regNumber: company.regNumber || '',
    bankingDetails,
    logo: assets.logo,
    stamp: assets.stamp,
    signature: assets.signature
  };
};
