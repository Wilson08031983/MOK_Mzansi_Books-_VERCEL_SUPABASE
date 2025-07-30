import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { VAT201Data } from '../services/vat201Service';

/**
 * Generate VAT 201 PDF report in landscape A4 format
 * @param vat201Data VAT 201 calculation data
 * @param reference Optional reference number
 */
export const generateVAT201PDF = async (vat201Data: VAT201Data, reference?: string): Promise<void> => {
  try {
    // Create new PDF document in landscape orientation
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    const contentWidth = pageWidth - (margin * 2);

    // Colors
    const primaryColor: [number, number, number] = [41, 128, 185]; // Blue
    const secondaryColor: [number, number, number] = [52, 73, 94]; // Dark gray
    const accentColor: [number, number, number] = [231, 76, 60]; // Red for amounts

    let yPosition = margin;

    // Header Section
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(margin, yPosition, contentWidth, 25, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('VAT 201 RETURN', margin + 10, yPosition + 8);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Value Added Tax Return', margin + 10, yPosition + 16);
    doc.text(`Period: ${vat201Data.period}`, pageWidth - margin - 80, yPosition + 8);
    doc.text(`Generated: ${new Date().toLocaleDateString('en-ZA')}`, pageWidth - margin - 80, yPosition + 16);
    
    yPosition += 35;

    // Company Information Section
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('COMPANY INFORMATION', margin, yPosition);
    yPosition += 8;

    const companyInfo = vat201Data.companyInfo;
    if (companyInfo) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      
      const companyData = [
        ['Company Name:', companyInfo.name || 'Not specified'],
        ['VAT Number:', vat201Data.vatNumber || 'Not specified'],
        ['Registration Number:', companyInfo.registrationNumber || 'Not specified'],
        ['Address:', companyInfo.address || 'Not specified'],
        ['Contact Number:', companyInfo.phone || 'Not specified'],
        ['Email:', companyInfo.email || 'Not specified']
      ];

      autoTable(doc, {
        startY: yPosition,
        head: [],
        body: companyData,
        theme: 'plain',
        styles: {
          fontSize: 10,
          cellPadding: 2
        },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 40 },
          1: { cellWidth: 80 }
        },
        margin: { left: margin, right: margin }
      });

      yPosition = (doc as any).lastAutoTable.finalY + 10;
    }

    // VAT Calculation Section
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('VAT CALCULATION SUMMARY', margin, yPosition);
    yPosition += 10;

    // Output VAT Table
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('OUTPUT VAT (VAT Collected)', margin, yPosition);
    yPosition += 5;

    const outputVATData = [
      ['Standard-rated supplies (15%)', `R ${vat201Data.outputVAT.standardRated.toFixed(2)}`],
      ['Zero-rated supplies', `R ${vat201Data.outputVAT.zeroRated.toFixed(2)}`],
      ['Exempt supplies', `R ${vat201Data.outputVAT.exempt.toFixed(2)}`],
      ['Exports', `R ${vat201Data.outputVAT.exports.toFixed(2)}`],
      ['TOTAL OUTPUT VAT', `R ${vat201Data.outputVAT.total.toFixed(2)}`]
    ];

    autoTable(doc, {
      startY: yPosition,
      head: [['Description', 'Amount']],
      body: outputVATData,
      theme: 'striped',
      headStyles: {
        fillColor: primaryColor,
        textColor: [255, 255, 255] as [number, number, number],
        fontStyle: 'bold'
      },
      styles: {
        fontSize: 10,
        cellPadding: 3
      },
      columnStyles: {
        0: { cellWidth: 80 },
        1: { cellWidth: 40, halign: 'right', fontStyle: 'bold' }
      },
      margin: { left: margin, right: pageWidth / 2 + 10 }
    });

    const outputTableY = (doc as any).lastAutoTable.finalY;

    // Input VAT Table (positioned next to Output VAT)
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('INPUT VAT (VAT Paid)', pageWidth / 2 + 20, yPosition);

    const inputVATData = [
      ['Standard-rated expenses', `R ${vat201Data.inputVAT.standardRated.toFixed(2)}`],
      ['Capital goods', `R ${vat201Data.inputVAT.capitalGoods.toFixed(2)}`],
      ['Import VAT', `R ${vat201Data.inputVAT.importVAT.toFixed(2)}`],
      ['TOTAL INPUT VAT', `R ${vat201Data.inputVAT.total.toFixed(2)}`]
    ];

    autoTable(doc, {
      startY: yPosition + 5,
      head: [['Description', 'Amount']],
      body: inputVATData,
      theme: 'striped',
      headStyles: {
        fillColor: primaryColor,
        textColor: [255, 255, 255] as [number, number, number],
        fontStyle: 'bold'
      },
      styles: {
        fontSize: 10,
        cellPadding: 3
      },
      columnStyles: {
        0: { cellWidth: 80 },
        1: { cellWidth: 40, halign: 'right', fontStyle: 'bold' }
      },
      margin: { left: pageWidth / 2 + 20, right: margin }
    });

    yPosition = Math.max(outputTableY, (doc as any).lastAutoTable.finalY) + 15;

    // Net VAT Calculation
    doc.setFillColor(240, 240, 240);
    doc.rect(margin, yPosition, contentWidth, 20, 'F');
    
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('NET VAT CALCULATION', margin + 10, yPosition + 7);
    
    doc.setFontSize(12);
    doc.text(`Total Output VAT: R ${vat201Data.outputVAT.total.toFixed(2)}`, margin + 10, yPosition + 14);
    doc.text(`Less: Total Input VAT: R ${vat201Data.inputVAT.total.toFixed(2)}`, margin + 120, yPosition + 14);
    
    // Net VAT amount (highlighted)
    const netVATText = vat201Data.netVAT >= 0 ? 'NET VAT PAYABLE' : 'NET VAT REFUNDABLE';
    const netVATAmount = Math.abs(vat201Data.netVAT);
    
    doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(`${netVATText}: R ${netVATAmount.toFixed(2)}`, pageWidth - margin - 100, yPosition + 14);
    
    yPosition += 30;

    // Period Details
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('TAX PERIOD DETAILS', margin, yPosition);
    yPosition += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Period Start Date: ${new Date(vat201Data.startDate).toLocaleDateString('en-ZA')}`, margin, yPosition);
    doc.text(`Period End Date: ${new Date(vat201Data.endDate).toLocaleDateString('en-ZA')}`, margin + 100, yPosition);
    doc.text(`Reference: ${reference || 'VAT201-' + new Date().getFullYear()}`, margin + 200, yPosition);
    
    yPosition += 20;

    // Declaration Section
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('DECLARATION', margin, yPosition);
    yPosition += 8;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const declarationText = [
      'I declare that the information furnished in this return is true and correct in every respect.',
      'I understand that any false declaration may result in prosecution and/or penalties.',
      'I undertake to keep proper records as required by the Value-Added Tax Act.',
      '',
      'This return must be submitted by the 25th day of the month following the end of the tax period.'
    ];

    declarationText.forEach(line => {
      doc.text(line, margin, yPosition);
      yPosition += 5;
    });

    yPosition += 10;

    // Signature Section
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('SIGNATURE SECTION', margin, yPosition);
    yPosition += 10;

    // Signature boxes
    const signatureBoxWidth = 80;
    const signatureBoxHeight = 20;
    
    // Full Name box
    doc.rect(margin, yPosition, signatureBoxWidth, signatureBoxHeight);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('Full Name:', margin + 2, yPosition + 5);
    doc.text('_________________________________', margin + 2, yPosition + 15);
    
    // Capacity box
    doc.rect(margin + signatureBoxWidth + 10, yPosition, signatureBoxWidth, signatureBoxHeight);
    doc.text('Capacity (Director/Accountant/etc.):', margin + signatureBoxWidth + 12, yPosition + 5);
    doc.text('_________________________________', margin + signatureBoxWidth + 12, yPosition + 15);
    
    yPosition += 25;
    
    // Date and Signature boxes
    doc.rect(margin, yPosition, signatureBoxWidth, signatureBoxHeight);
    doc.text('Date:', margin + 2, yPosition + 5);
    doc.text('_________________________________', margin + 2, yPosition + 15);
    
    doc.rect(margin + signatureBoxWidth + 10, yPosition, signatureBoxWidth, signatureBoxHeight);
    doc.text('Signature:', margin + signatureBoxWidth + 12, yPosition + 5);
    doc.text('_________________________________', margin + signatureBoxWidth + 12, yPosition + 15);

    // Footer
    yPosition = pageHeight - 20;
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text('Generated by MOK Mzansi Books - VAT 201 Return', margin, yPosition);
    doc.text(`Page 1 of 1`, pageWidth - margin - 30, yPosition);

    // Save the PDF
    const fileName = `VAT201_${vat201Data.period.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);

  } catch (error) {
    console.error('Error generating VAT 201 PDF:', error);
    throw new Error('Failed to generate VAT 201 PDF report');
  }
};

/**
 * Generate VAT 201 history PDF with multiple returns
 * @param returns Array of VAT 201 returns
 */
export const generateVAT201HistoryPDF = async (returns: any[]): Promise<void> => {
  try {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    const contentWidth = pageWidth - (margin * 2);

    let yPosition = margin;

    // Header
    doc.setFillColor(41, 128, 185);
    doc.rect(margin, yPosition, contentWidth, 20, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('VAT 201 RETURNS HISTORY', margin + 10, yPosition + 8);
    doc.text(`Generated: ${new Date().toLocaleDateString('en-ZA')}`, pageWidth - margin - 60, yPosition + 8);
    
    yPosition += 30;

    // Returns table
    const tableData = returns.map(ret => [
      ret.period,
      ret.reference,
      `R ${ret.outputVAT.toFixed(2)}`,
      `R ${ret.inputVAT.toFixed(2)}`,
      `R ${ret.netVAT.toFixed(2)}`,
      ret.status.charAt(0).toUpperCase() + ret.status.slice(1),
      new Date(ret.createdAt).toLocaleDateString('en-ZA')
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [['Period', 'Reference', 'Output VAT', 'Input VAT', 'Net VAT', 'Status', 'Created']],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      styles: {
        fontSize: 9,
        cellPadding: 3
      },
      columnStyles: {
        2: { halign: 'right' },
        3: { halign: 'right' },
        4: { halign: 'right' }
      },
      margin: { left: margin, right: margin }
    });

    // Summary
    const totalOutputVAT = returns.reduce((sum, ret) => sum + ret.outputVAT, 0);
    const totalInputVAT = returns.reduce((sum, ret) => sum + ret.inputVAT, 0);
    const totalNetVAT = returns.reduce((sum, ret) => sum + ret.netVAT, 0);

    yPosition = (doc as any).lastAutoTable.finalY + 15;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('SUMMARY', margin, yPosition);
    yPosition += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total Returns: ${returns.length}`, margin, yPosition);
    doc.text(`Total Output VAT: R ${totalOutputVAT.toFixed(2)}`, margin + 60, yPosition);
    doc.text(`Total Input VAT: R ${totalInputVAT.toFixed(2)}`, margin + 140, yPosition);
    doc.text(`Total Net VAT: R ${totalNetVAT.toFixed(2)}`, margin + 220, yPosition);

    const fileName = `VAT201_History_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);

  } catch (error) {
    console.error('Error generating VAT 201 history PDF:', error);
    throw new Error('Failed to generate VAT 201 history PDF');
  }
};