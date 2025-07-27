/**
 * Tax History PDF Generator
 * 
 * This module generates professional A4 Landscape PDF reports for South African business tax returns
 * with SF Pro font styling and Apple Sequoia theme design.
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatCompanyForPdf } from './companyUtils';
import { BusinessTaxReturn } from '../components/accounting/BusinessTaxCard';

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

// Tax type display names mapping
const TAX_TYPE_NAMES: Record<string, string> = {
  'VAT201': 'VAT 201 - Value Added Tax Return',
  'PAYE_EMP201': 'PAYE/EMP201 - Employee Tax Return',
  'IRP6': 'IRP6 - Provisional Tax Return',
  'ITR14': 'ITR14 - Company Income Tax Return',
  'DTR01': 'DTR01 - Dividends Tax Return',
  'CUSTOMS': 'Customs & Excise Return',
  'TURNOVER': 'Turnover Tax Return'
};

// Status display names
const STATUS_NAMES: Record<string, string> = {
  'pending': 'Pending',
  'submitted': 'Submitted',
  'completed': 'Completed',
  'overdue': 'Overdue',
  'draft': 'Draft'
};

/**
 * Generate tax history PDF report for a specific tax type
 * @param taxType The tax type to generate report for
 * @param taxReturns Array of all tax returns (will be filtered by type)
 * @returns Promise that resolves when PDF is generated and downloaded
 */
export const generateTaxHistoryPDF = async (
  taxType: string,
  taxReturns: BusinessTaxReturn[]
): Promise<void> => {
  try {
    // Filter returns by tax type
    const filteredReturns = taxReturns.filter(tr => tr.type === taxType);
    
    if (filteredReturns.length === 0) {
      alert(`No ${TAX_TYPE_NAMES[taxType] || taxType} returns found to generate report.`);
      return;
    }

    // Get company information
    const company = formatCompanyForPdf();
    
    // Create PDF document in landscape orientation
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    // Set up fonts and colors
    doc.setFont('helvetica'); // Using helvetica as SF Pro alternative
    
    // Page dimensions for A4 landscape
    const pageWidth = 297;
    const pageHeight = 210;
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);
    
    // Header section
    let yPosition = margin;
    
    // Company logo (if available)
    if (company.logo) {
      try {
        doc.addImage(company.logo, 'PNG', margin, yPosition, 40, 20);
        yPosition += 25;
      } catch (error) {
        console.warn('Could not add company logo to PDF:', error);
        yPosition += 5;
      }
    }
    
    // Company name and details
    doc.setFontSize(20);
    doc.setTextColor(51, 51, 51); // Dark gray
    const companyName = company.name || 'Company Name Not Set';
    doc.text(companyName, margin, yPosition);
    yPosition += 8;
    
    doc.setFontSize(10);
    doc.setTextColor(102, 102, 102); // Medium gray
    if (company.email) {
      doc.text(`Email: ${company.email}`, margin, yPosition);
      yPosition += 4;
    }
    if (company.phone) {
      doc.text(`Phone: ${company.phone}`, margin, yPosition);
      yPosition += 4;
    }
    if (company.regNumber) {
      doc.text(`Registration Number: ${company.regNumber}`, margin, yPosition);
      yPosition += 4;
    }
    if (company.vatNumber && company.vatNumber !== 'N/A') {
      doc.text(`VAT Number: ${company.vatNumber}`, margin, yPosition);
      yPosition += 4;
    }
    
    yPosition += 10;
    
    // Report title
    doc.setFontSize(18);
    doc.setTextColor(255, 107, 0); // MOK orange color
    const reportTitle = `${TAX_TYPE_NAMES[taxType] || taxType} - History Report`;
    doc.text(reportTitle, margin, yPosition);
    yPosition += 8;
    
    // Report generation date
    doc.setFontSize(10);
    doc.setTextColor(102, 102, 102);
    const reportDate = `Generated on: ${new Date().toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}`;
    doc.text(reportDate, margin, yPosition);
    yPosition += 15;
    
    // Summary statistics
    const totalReturns = filteredReturns.length;
    const totalAmount = filteredReturns.reduce((sum, tr) => sum + (tr.amount || 0), 0);
    const pendingReturns = filteredReturns.filter(tr => tr.status === 'pending').length;
    const completedReturns = filteredReturns.filter(tr => tr.status === 'completed').length;
    const overdueReturns = filteredReturns.filter(tr => {
      return tr.status !== 'completed' && new Date(tr.dueDate) < new Date();
    }).length;
    
    doc.setFontSize(12);
    doc.setTextColor(51, 51, 51);
    doc.text('Summary Statistics:', margin, yPosition);
    yPosition += 6;
    
    doc.setFontSize(10);
    doc.text(`Total Returns: ${totalReturns}`, margin, yPosition);
    doc.text(`Total Amount: R${totalAmount.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}`, margin + 60, yPosition);
    yPosition += 4;
    doc.text(`Pending: ${pendingReturns}`, margin, yPosition);
    doc.text(`Completed: ${completedReturns}`, margin + 60, yPosition);
    doc.text(`Overdue: ${overdueReturns}`, margin + 120, yPosition);
    yPosition += 15;
    
    // Prepare table data
    const tableData = filteredReturns
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) // Sort by creation date, newest first
      .map(tr => [
        new Date(tr.createdAt).toLocaleDateString('en-ZA'),
        tr.period || 'N/A',
        tr.reference || 'N/A',
        STATUS_NAMES[tr.status] || tr.status,
        new Date(tr.dueDate).toLocaleDateString('en-ZA'),
        `R${(tr.amount || 0).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}`,
        tr.description || 'N/A'
      ]);
    
    // Table headers
    const tableHeaders = [
      'Date Created',
      'Tax Period',
      'Reference Number',
      'Status',
      'Due Date',
      'Amount',
      'Description'
    ];
    
    // Generate table
    autoTable(doc, {
      head: [tableHeaders],
      body: tableData,
      startY: yPosition,
      margin: { left: margin, right: margin },
      styles: {
        fontSize: 9,
        cellPadding: 3,
        font: 'helvetica'
      },
      headStyles: {
        fillColor: [255, 107, 0], // MOK orange
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 10
      },
      alternateRowStyles: {
        fillColor: [248, 249, 250] // Light gray
      },
      columnStyles: {
        0: { cellWidth: 25 }, // Date Created
        1: { cellWidth: 30 }, // Tax Period
        2: { cellWidth: 35 }, // Reference Number
        3: { cellWidth: 20 }, // Status
        4: { cellWidth: 25 }, // Due Date
        5: { cellWidth: 30, halign: 'right' }, // Amount
        6: { cellWidth: 92 } // Description
      },
      didDrawPage: (data) => {
        // Add page numbers
        const pageCount = doc.getNumberOfPages();
        const currentPage = doc.getCurrentPageInfo().pageNumber;
        
        doc.setFontSize(8);
        doc.setTextColor(102, 102, 102);
        doc.text(
          `Page ${currentPage} of ${pageCount}`,
          pageWidth - margin - 20,
          pageHeight - 10
        );
        
        // Add footer with generation timestamp
        doc.text(
          `Generated by MOK Mzansi Books - ${new Date().toISOString().split('T')[0]}`,
          margin,
          pageHeight - 10
        );
      }
    });
    
    // Add disclaimer/notes section if there's space
    const finalY = (doc as any).lastAutoTable?.finalY || yPosition + 50;
    if (finalY < pageHeight - 40) {
      doc.setFontSize(8);
      doc.setTextColor(102, 102, 102);
      doc.text('Notes:', margin, finalY + 15);
      doc.text('• This report contains historical tax return data stored locally in the application.', margin, finalY + 20);
      doc.text('• All amounts are in South African Rand (ZAR).', margin, finalY + 25);
      doc.text('• For official SARS submissions, please use the SARS eFiling platform.', margin, finalY + 30);
    }
    
    // Generate filename
    const sanitizedTaxType = taxType.replace(/[^a-zA-Z0-9]/g, '_');
    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `${sanitizedTaxType}_History_Report_${dateStr}.pdf`;
    
    // Save the PDF
    doc.save(filename);
    
    console.log(`Tax history PDF generated successfully: ${filename}`);
    
  } catch (error) {
    console.error('Error generating tax history PDF:', error);
    alert('An error occurred while generating the PDF report. Please try again.');
  }
};

/**
 * Get tax type display name
 * @param taxType The tax type code
 * @returns Human-readable tax type name
 */
export const getTaxTypeDisplayName = (taxType: string): string => {
  return TAX_TYPE_NAMES[taxType] || taxType;
};

/**
 * Get available tax types for dropdown/selection
 * @returns Array of tax type objects with code and display name
 */
export const getAvailableTaxTypes = (): Array<{ code: string; name: string }> => {
  return Object.entries(TAX_TYPE_NAMES).map(([code, name]) => ({ code, name }));
};