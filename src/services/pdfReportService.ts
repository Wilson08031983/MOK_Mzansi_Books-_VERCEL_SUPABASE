import { ReportData, ReportType, ReportFilters } from './reportGenerationService';

class PDFReportService {
  /**
   * Download report as A4 PDF
   */
  async downloadReport(reportData: ReportData, reportType: ReportType, filters: ReportFilters): Promise<void> {
    console.log('📄 [PDF SERVICE] Generating PDF for report:', reportType);

    try {
      // For now, we'll create a simple HTML-based PDF using browser's print functionality
      // This avoids the need for external dependencies like jsPDF
      const htmlContent = this.generateHTMLReport(reportData, reportType, filters);
      
      // Create a new window with the report content
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        throw new Error('Unable to open print window. Please allow popups for this site.');
      }

      printWindow.document.write(htmlContent);
      printWindow.document.close();

      // Wait a moment for content to load, then trigger print
      setTimeout(() => {
        printWindow.print();
        // Close the window after printing
        setTimeout(() => {
          printWindow.close();
        }, 1000);
      }, 500);

      console.log('✅ [PDF SERVICE] PDF generation initiated');
    } catch (error) {
      console.error('❌ [PDF SERVICE] Error generating PDF:', error);
      throw error;
    }
  }

  /**
   * Generate HTML content for the report
   */
  private generateHTMLReport(reportData: ReportData, reportType: ReportType, filters: ReportFilters): string {
    const reportTitle = this.getReportTitle(reportType);
    const currentDate = new Date().toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${reportTitle} - MOK Mzansi Books</title>
    <style>
        @page {
            size: A4;
            margin: 20mm;
        }
        
        body {
            font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 11px;
            line-height: 1.4;
            color: #333;
            margin: 0;
            padding: 0;
        }
        
        .header {
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 15px;
            margin-bottom: 20px;
        }
        
        .company-name {
            font-size: 24px;
            font-weight: bold;
            background: linear-gradient(135deg, #f97316, #ec4899, #8b5cf6);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 5px;
        }
        
        .report-title {
            font-size: 18px;
            font-weight: 600;
            color: #1e293b;
            margin-bottom: 10px;
        }
        
        .report-meta {
            display: flex;
            justify-content: space-between;
            font-size: 10px;
            color: #64748b;
        }
        
        .summary-section {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 20px;
        }
        
        .summary-title {
            font-size: 14px;
            font-weight: 600;
            color: #1e293b;
            margin-bottom: 10px;
        }
        
        .summary-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 15px;
        }
        
        .summary-item {
            text-align: center;
        }
        
        .summary-label {
            font-size: 10px;
            color: #64748b;
            margin-bottom: 5px;
        }
        
        .summary-value {
            font-size: 14px;
            font-weight: 600;
            color: #1e293b;
        }
        
        .data-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            font-size: 10px;
        }
        
        .data-table th {
            background: #f1f5f9;
            border: 1px solid #e2e8f0;
            padding: 8px;
            text-align: left;
            font-weight: 600;
            color: #475569;
        }
        
        .data-table td {
            border: 1px solid #e2e8f0;
            padding: 8px;
            color: #334155;
        }
        
        .data-table tr:nth-child(even) {
            background: #f8fafc;
        }
        
        .amount {
            text-align: right;
            font-weight: 500;
        }
        
        .positive {
            color: #059669;
        }
        
        .negative {
            color: #dc2626;
        }
        
        .footer {
            margin-top: 30px;
            padding-top: 15px;
            border-top: 1px solid #e2e8f0;
            font-size: 9px;
            color: #64748b;
            text-align: center;
        }
        
        .filters-section {
            background: #fefefe;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            padding: 12px;
            margin-bottom: 20px;
            font-size: 10px;
        }
        
        .filters-title {
            font-weight: 600;
            margin-bottom: 8px;
            color: #374151;
        }
        
        .filter-item {
            display: inline-block;
            margin-right: 15px;
            margin-bottom: 5px;
        }
        
        .filter-label {
            font-weight: 500;
            color: #6b7280;
        }
        
        .filter-value {
            color: #1f2937;
        }
        
        @media print {
            body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
            
            .no-print {
                display: none;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="company-name">MOK Mzansi Books</div>
        <div class="report-title">${reportTitle}</div>
        <div class="report-meta">
            <span>Generated: ${currentDate}</span>
            <span>Records: ${reportData.summary.totalRecords}</span>
        </div>
    </div>

    ${this.generateFiltersSection(filters)}

    <div class="summary-section">
        <div class="summary-title">Report Summary</div>
        <div class="summary-grid">
            <div class="summary-item">
                <div class="summary-label">Total Amount</div>
                <div class="summary-value ${reportData.summary.totalAmount >= 0 ? 'positive' : 'negative'}">
                    R${Math.abs(reportData.summary.totalAmount).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                </div>
            </div>
            <div class="summary-item">
                <div class="summary-label">Total Records</div>
                <div class="summary-value">${reportData.summary.totalRecords}</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">Average Amount</div>
                <div class="summary-value">
                    R${reportData.summary.averageAmount.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                </div>
            </div>
        </div>
        ${this.generateAdditionalSummary(reportData.summary)}
    </div>

    ${this.generateDataTable(reportData.data, reportType)}

    <div class="footer">
        <p>This report was generated by MOK Mzansi Books - Professional Business Management System</p>
        <p>Report ID: ${reportData.metadata.reportType}-${Date.now()}</p>
    </div>
</body>
</html>`;
  }

  /**
   * Generate filters section HTML
   */
  private generateFiltersSection(filters: ReportFilters): string {
    const activeFilters = Object.entries(filters)
      .filter(([key, value]) => value && value !== 'all' && value !== '')
      .map(([key, value]) => {
        const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        return `<span class="filter-item"><span class="filter-label">${label}:</span> <span class="filter-value">${value}</span></span>`;
      });

    if (activeFilters.length === 0) {
      return `
        <div class="filters-section">
          <div class="filters-title">Applied Filters</div>
          <span class="filter-item"><span class="filter-value">No filters applied - showing all data</span></span>
        </div>`;
    }

    return `
      <div class="filters-section">
        <div class="filters-title">Applied Filters</div>
        ${activeFilters.join('')}
      </div>`;
  }

  /**
   * Generate additional summary information based on report type
   */
  private generateAdditionalSummary(summary: any): string {
    let additionalInfo = '';

    if (summary.totalIncome !== undefined && summary.totalExpenses !== undefined) {
      additionalInfo += `
        <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e2e8f0;">
          <div class="summary-grid">
            <div class="summary-item">
              <div class="summary-label">Total Income</div>
              <div class="summary-value positive">R${summary.totalIncome.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">Total Expenses</div>
              <div class="summary-value negative">R${summary.totalExpenses.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">Net Profit</div>
              <div class="summary-value ${summary.netProfit >= 0 ? 'positive' : 'negative'}">
                R${Math.abs(summary.netProfit).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>
        </div>`;
    }

    if (summary.complianceRate !== undefined) {
      additionalInfo += `
        <div style="margin-top: 10px;">
          <div class="summary-item">
            <div class="summary-label">Compliance Rate</div>
            <div class="summary-value">${summary.complianceRate}%</div>
          </div>
        </div>`;
    }

    return additionalInfo;
  }

  /**
   * Generate data table HTML
   */
  private generateDataTable(data: any[], reportType: ReportType): string {
    if (!data || data.length === 0) {
      return `
        <div style="text-align: center; padding: 40px; color: #64748b;">
          <p>No data available for the selected criteria.</p>
        </div>`;
    }

    const headers = Object.keys(data[0]);
    const headerRow = headers.map(header => {
      const displayName = header.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
      return `<th>${displayName}</th>`;
    }).join('');

    const dataRows = data.map(row => {
      const cells = headers.map(header => {
        let value = row[header];
        let className = '';

        // Format amounts
        if (typeof value === 'number' && (header.toLowerCase().includes('amount') || header.toLowerCase().includes('total'))) {
          className = 'amount';
          if (value < 0) className += ' negative';
          else if (value > 0) className += ' positive';
          value = `R${Math.abs(value).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}`;
        }

        // Format percentages
        if (header.toLowerCase().includes('percentage') || header.toLowerCase().includes('rate')) {
          value = `${value}%`;
        }

        // Handle null/undefined values
        if (value === null || value === undefined || value === '') {
          value = '-';
        }

        return `<td class="${className}">${value}</td>`;
      }).join('');

      return `<tr>${cells}</tr>`;
    }).join('');

    return `
      <table class="data-table">
        <thead>
          <tr>${headerRow}</tr>
        </thead>
        <tbody>
          ${dataRows}
        </tbody>
      </table>`;
  }

  /**
   * Get human-readable report title
   */
  private getReportTitle(reportType: ReportType): string {
    const titles: Record<ReportType, string> = {
      'expense-summary': 'Expense Summary Report',
      'expense-category': 'Expense Category Analysis',
      'expense-payment-method': 'Payment Method Distribution',
      'expense-project': 'Project Expense Allocation',
      'expense-receipt-compliance': 'Receipt Compliance Report',
      'expense-bank-integration': 'Bank Integration Analysis',
      'income-summary': 'Income Summary Report',
      'income-status': 'Income Status Breakdown',
      'income-client': 'Revenue by Client',
      'income-service': 'Revenue by Service Type',
      'income-invoice': 'Invoice Performance Report',
      'income-payment-method': 'Income Payment Methods',
      'tax-summary': 'Tax Returns Overview',
      'tax-type': 'Tax Returns by Type',
      'tax-compliance': 'Tax Compliance Report',
      'tax-liability': 'Tax Liability Analysis',
      'tax-period': 'Tax Returns by Period',
      'tax-entry-method': 'Tax Entry Method Analysis',
      'profit-loss': 'Profit & Loss Statement',
      'cash-flow': 'Cash Flow Analysis',
      'tax-impact': 'Tax Impact Analysis'
    };

    return titles[reportType] || 'Financial Report';
  }
}

export const pdfReportService = new PDFReportService();
