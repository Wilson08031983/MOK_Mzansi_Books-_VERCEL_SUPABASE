import jsPDF from 'jspdf';
import { PayrollCalculation } from './payrollCalculationService';
import { Employee } from './employeeService';

interface CompanyDetails {
  name: string;
  email: string;
  phone: string;
  website: string;
  address: {
    line1: string;
    line2: string;
    line3: string;
    line4: string;
  };
  logo?: string;
  signature?: string;
}

export class PayslipService {
  private static getCompanyDetails(): CompanyDetails {
    // Get company details from localStorage or use defaults
    const companyData = localStorage.getItem('companyDetails');
    const companyAssets = localStorage.getItem('companyAssets');
    
    let logo: string | undefined;
    let signature: string | undefined;
    
    if (companyAssets) {
      try {
        const assets = JSON.parse(companyAssets);
        // Assets are stored with capitalized keys and dataUrl property
        logo = assets.Logo?.dataUrl;
        signature = assets.Signature?.dataUrl;
        console.log('Company assets loaded:', { hasLogo: !!logo, hasSignature: !!signature });
      } catch (error) {
        console.warn('Error parsing company assets:', error);
      }
    }
    
    if (companyData) {
      const parsed = JSON.parse(companyData);
      return {
        name: parsed.companyName || 'MOK Mzansi Books',
        email: parsed.email || 'admin@mokmzansibooks.com',
        phone: parsed.phone || '+27 11 123 4567',
        website: parsed.website || 'www.mokmzansibooks.com',
        address: {
          line1: parsed.addressLine1 || '123 Business Street',
          line2: parsed.addressLine2 || 'Atteridgeville',
          line3: parsed.addressLine3 || 'Pretoria',
          line4: parsed.addressLine4 || 'Johannesburg, 2000'
        },
        logo,
        signature
      };
    }
    
    return {
      name: 'MOK Mzansi Books',
      email: 'admin@mokmzansibooks.com',
      phone: '+27 11 123 4567',
      website: 'www.mokmzansibooks.com',
      address: {
        line1: '123 Business Street',
        line2: 'Atteridgeville',
        line3: 'Pretoria',
        line4: 'Johannesburg, 2000'
      },
      logo,
      signature
    };
  }

  private static generateEmployeeNumber(employeeId: string): string {
    // Generate a formatted employee number from the ID
    const prefix = 'EMP';
    const numericPart = employeeId.replace(/[^0-9]/g, '').slice(-4).padStart(4, '0');
    return `${prefix}${numericPart}`;
  }

  private static formatCurrency(amount: number): string {
    return `R ${amount.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  private static formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-ZA', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }

  private static getCurrentPayPeriod(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    
    // Get first and last day of current month
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    return `${firstDay.toLocaleDateString('en-ZA')} - ${lastDay.toLocaleDateString('en-ZA')}`;
  }

  static async generatePayslip(
    employee: Employee, 
    payrollData: PayrollCalculation
  ): Promise<void> {
    const pdf = new jsPDF('portrait', 'mm', 'a4');
    const company = this.getCompanyDetails();
    const employeeNumber = this.generateEmployeeNumber(employee.id);
    const payPeriod = this.getCurrentPayPeriod();
    
    // Set up fonts and colors
    pdf.setFont('helvetica');
    
    // Page margins
    const margin = 20;
    const pageWidth = pdf.internal.pageSize.getWidth();
    const contentWidth = pageWidth - (margin * 2);
    
    let yPosition = margin;
    
    // Header - Company Details and Logo
    console.log('Company logo available:', !!company.logo);
    
    // Company name and details on the left
    pdf.setFontSize(18);
    pdf.setTextColor(0, 0, 0);
    pdf.text(company.name, margin, yPosition + 8);
    
    // Add logo on the right side if available
    if (company.logo) {
      try {
        console.log('Adding logo to PDF...');
        const logoSize = 30; // Slightly larger logo size in mm
        const logoX = pageWidth - margin - logoSize; // Position on right side
        pdf.addImage(company.logo, 'PNG', logoX, yPosition, logoSize, logoSize);
        console.log('Logo added successfully');
      } catch (error) {
        console.warn('Error adding logo to PDF:', error);
      }
    } else {
      console.log('No logo found');
    }
    
    yPosition += 30; // Space for logo height
    
    pdf.setFontSize(10);
    pdf.setTextColor(100, 100, 100);
    pdf.text(company.address.line1, margin, yPosition);
    yPosition += 4;
    pdf.text(`${company.address.line2}, ${company.address.line3}`, margin, yPosition);
    yPosition += 4;
    pdf.text(company.address.line4, margin, yPosition);
    yPosition += 4;
    pdf.text(`Email: ${company.email} | Phone: ${company.phone}`, margin, yPosition);
    yPosition += 4;
    pdf.text(`Website: ${company.website}`, margin, yPosition);
    yPosition += 20; // Increased spacing
    
    // Title
    pdf.setFontSize(16);
    pdf.setTextColor(0, 0, 0);
    const title = 'PAYSLIP / PAY ADVICE';
    const titleWidth = pdf.getTextWidth(title);
    pdf.text(title, (pageWidth - titleWidth) / 2, yPosition);
    yPosition += 25; // Increased spacing after title
    
    // Employee Information Section
    pdf.setFontSize(12);
    pdf.setTextColor(0, 0, 0);
    pdf.text('EMPLOYEE INFORMATION', margin, yPosition);
    yPosition += 8;
    
    // Draw border for employee info
    pdf.setDrawColor(200, 200, 200);
    pdf.rect(margin, yPosition - 2, contentWidth, 25);
    
    pdf.setFontSize(10);
    const leftCol = margin + 5;
    const rightCol = margin + (contentWidth / 2);
    
    pdf.text(`Employee Number: ${employeeNumber}`, leftCol, yPosition + 3);
    pdf.text(`Pay Period: ${payPeriod}`, rightCol, yPosition + 3);
    yPosition += 6;
    
    pdf.text(`Name: ${employee.firstName} ${employee.surname}`, leftCol, yPosition + 3);
    pdf.text(`Position: ${employee.position || 'Not specified'}`, rightCol, yPosition + 3);
    yPosition += 6;
    
    pdf.text(`Department: ${employee.department || 'Not specified'}`, leftCol, yPosition + 3);
    pdf.text(`Employee ID: ${employee.id.slice(0, 8)}...`, rightCol, yPosition + 3);
    yPosition += 6;
    
    pdf.text(`Base Salary: ${this.formatCurrency(employee.salary)}`, leftCol, yPosition + 3);
    yPosition += 10;
    
    // Hours Breakdown Section
    pdf.setFontSize(12);
    pdf.text('HOURS BREAKDOWN', margin, yPosition);
    yPosition += 8;
    
    pdf.rect(margin, yPosition - 2, contentWidth, 20);
    pdf.setFontSize(10);
    
    pdf.text(`Regular Hours: ${payrollData.regularHours.toFixed(1)}h`, leftCol, yPosition + 3);
    pdf.text(`Overtime Hours: ${payrollData.overtimeHours.toFixed(1)}h`, rightCol, yPosition + 3);
    yPosition += 6;
    
    pdf.text(`Night Shift Hours: ${payrollData.nightShiftHours.toFixed(1)}h`, leftCol, yPosition + 3);
    pdf.text(`Leave Hours: ${payrollData.leaveHours.toFixed(1)}h`, rightCol, yPosition + 3);
    yPosition += 6;
    
    pdf.setTextColor(0, 100, 0);
    pdf.text(`Total Hours: ${(payrollData.regularHours + payrollData.overtimeHours + payrollData.nightShiftHours + payrollData.leaveHours).toFixed(1)}h`, leftCol, yPosition + 3);
    pdf.setTextColor(0, 0, 0);
    yPosition += 15;
    
    // Earnings Section
    pdf.setFontSize(12);
    pdf.text('EARNINGS', margin, yPosition);
    yPosition += 8;
    
    // Increased box height to accommodate all content including gross salary
    pdf.rect(margin, yPosition - 2, contentWidth, 35);
    pdf.setFontSize(10);
    
    pdf.text(`Base Salary: ${this.formatCurrency(payrollData.baseSalary)}`, leftCol, yPosition + 3);
    pdf.text(`Attendance Pay: ${this.formatCurrency(payrollData.attendancePay)}`, rightCol, yPosition + 3);
    yPosition += 6;
    
    pdf.text(`Housing Allowance: ${this.formatCurrency(payrollData.allowances.housingAllowance || 0)}`, leftCol, yPosition + 3);
    pdf.text(`Medical Aid Allowance: ${this.formatCurrency(payrollData.allowances.medicalAidAllowance || 0)}`, rightCol, yPosition + 3);
    yPosition += 6;
    
    pdf.text(`13th Month Bonus: ${this.formatCurrency(payrollData.allowances.thirteenthMonthBonus || 0)}`, leftCol, yPosition + 3);
    pdf.text(`Motor Vehicle Allowance: ${this.formatCurrency(payrollData.allowances.motorVehicleAllowance || 0)}`, rightCol, yPosition + 3);
    yPosition += 6;
    
    pdf.text(`Other Allowances: ${this.formatCurrency(payrollData.allowances.otherAllowances || 0)}`, leftCol, yPosition + 3);
    pdf.text(`Total Allowances: ${this.formatCurrency(payrollData.allowances.totalAllowances)}`, rightCol, yPosition + 3);
    yPosition += 6;
    
    // Gross salary inside the box with highlighting
    pdf.setTextColor(0, 150, 0);
    pdf.setFontSize(11);
    pdf.text(`GROSS SALARY: ${this.formatCurrency(payrollData.grossSalary)}`, leftCol, yPosition + 3);
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(10);
    yPosition += 15;
    
    // Deductions Section
    pdf.setFontSize(12);
    pdf.text('DEDUCTIONS', margin, yPosition);
    yPosition += 8;
    
    pdf.rect(margin, yPosition - 2, contentWidth, 25);
    pdf.setFontSize(10);
    
    pdf.text(`PAYE Tax: ${this.formatCurrency(payrollData.deductions.tax)}`, leftCol, yPosition + 3);
    pdf.text(`UIF: ${this.formatCurrency(payrollData.deductions.uif)}`, rightCol, yPosition + 3);
    yPosition += 6;
    
    pdf.text(`Medical Aid: ${this.formatCurrency(payrollData.deductions.medicalAid)}`, leftCol, yPosition + 3);
    pdf.text(`Retirement Fund: ${this.formatCurrency(payrollData.deductions.retirementFund)}`, rightCol, yPosition + 3);
    yPosition += 6;
    
    pdf.text(`Salary Advance: ${this.formatCurrency(payrollData.deductions.salaryAdvance || 0)}`, leftCol, yPosition + 3);
    pdf.text(`Other Deductions: ${this.formatCurrency(payrollData.deductions.otherDeductions || 0)}`, rightCol, yPosition + 3);
    yPosition += 6;
    
    pdf.setTextColor(200, 0, 0);
    pdf.setFontSize(11);
    pdf.text(`TOTAL DEDUCTIONS: ${this.formatCurrency(payrollData.deductions.totalDeductions)}`, leftCol, yPosition + 3);
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(10);
    yPosition += 15;
    
    // Net Salary Section
    pdf.setFillColor(240, 240, 240);
    pdf.rect(margin, yPosition - 2, contentWidth, 15, 'F');
    pdf.setFontSize(14);
    pdf.setTextColor(0, 100, 0);
    const netSalaryText = `NET SALARY: ${this.formatCurrency(payrollData.netSalary)}`;
    const netSalaryWidth = pdf.getTextWidth(netSalaryText);
    pdf.text(netSalaryText, (pageWidth - netSalaryWidth) / 2, yPosition + 8);
    yPosition += 20;
    
    // Calculation Formula
    pdf.setFontSize(9);
    pdf.setTextColor(100, 100, 100);
    const formula = `Calculation: Base Salary (${this.formatCurrency(payrollData.baseSalary)}) + Gross Salary (${this.formatCurrency(payrollData.grossSalary)}) - Total Deductions (${this.formatCurrency(payrollData.deductions.totalDeductions)})`;
    pdf.text(formula, margin, yPosition + 3);
    yPosition += 15;
    
    // Signature Section
    console.log('Company signature available:', !!company.signature);
    if (company.signature) {
      try {
        console.log('Adding signature to PDF...');
        yPosition += 10;
        pdf.setFontSize(10);
        pdf.setTextColor(0, 0, 0);
        pdf.text('Authorized Signature:', margin, yPosition);
        yPosition += 5;
        
        // Add signature image
        const signatureWidth = 40; // Signature width in mm
        const signatureHeight = 15; // Signature height in mm
        pdf.addImage(company.signature, 'PNG', margin, yPosition, signatureWidth, signatureHeight);
        yPosition += signatureHeight + 5;
        console.log('Signature added successfully');
      } catch (error) {
        console.warn('Error adding signature to PDF:', error);
        yPosition += 10;
      }
    } else {
      console.log('No signature found, skipping signature section');
      yPosition += 10;
    }
    
    // Footer
    pdf.setFontSize(8);
    pdf.setTextColor(150, 150, 150);
    const footerText = `Generated on ${new Date().toLocaleDateString('en-ZA')} at ${new Date().toLocaleTimeString('en-ZA')}`;
    const footerWidth = pdf.getTextWidth(footerText);
    pdf.text(footerText, (pageWidth - footerWidth) / 2, yPosition + 10);
    
    // Generate filename
    const fileName = `Payslip_${employee.firstName}_${employee.surname}_${new Date().toISOString().slice(0, 7)}.pdf`;
    
    // Download the PDF and return a promise
    return new Promise<void>((resolve) => {
      try {
        pdf.save(fileName);
        // Add a small delay to ensure the download starts
        setTimeout(() => {
          resolve();
        }, 200);
      } catch (error) {
        throw error;
      }
    });
  }
}
