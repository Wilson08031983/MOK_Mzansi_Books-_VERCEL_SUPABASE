export const translations = {
  en: {
    // Navigation
    nav: {
      dashboard: 'Dashboard',
      company: 'My Company',
      clients: 'Clients',
      quotations: 'Quotations',
      invoices: 'Invoices',
      projects: 'Projects',
      inventory: 'Inventory',
      hr: 'HR Management',
      accounting: 'Accounting',
      settings: 'Settings'
    },
    // Dashboard
    dashboard: {
      title: 'Dashboard',
      welcome: 'Welcome back',
      overview: 'Business Overview',
      recentActivity: 'Recent Activity',
      quickActions: 'Quick Actions',
      expensesByCategory: 'Expenses by Category',
      stats: {
        totalRevenue: 'Total Revenue',
        activeProjects: 'Active Projects',
        pendingInvoices: 'Pending Invoices',
        totalClients: 'Total Clients'
      }
    },
    // Company
    company: {
      title: 'My Company',
      details: 'Company Details',
      information: 'Company Information',
      address: 'Address',
      contact: 'Contact Information',
      logo: 'Logo',
      save: 'Save',
      edit: 'Edit',
      cancel: 'Cancel',
      tabs: {
        companyDetails: 'Company Details',
        teamManagement: 'Team Management',
        activityLog: 'Activity Log'
      },
      activityLog: {
        headerTitle: 'System Audit Log',
        headerSubtitle: 'Comprehensive tracking of all user actions and system changes',
        buttons: {
          filters: 'Filters',
          export: 'Export',
          clearFilters: 'Clear Filters',
          clearLog: 'Clear Log'
        },
        stats: {
          totalEntries: 'Total Entries',
          critical: 'Critical',
          activeUsers: 'Active Users',
          today: 'Today'
        },
        filters: {
          title: 'Filter Options',
          searchLabel: 'Search',
          searchPlaceholder: 'Search actions, users, descriptions...',
          category: 'Category',
          severity: 'Severity',
          page: 'Page',
          changeType: 'Change Type',
          dateFrom: 'Date From',
          dateTo: 'Date To',
          allCategories: 'All Categories',
          allSeverities: 'All Severities',
          allPages: 'All Pages',
          allTypes: 'All Types',
          create: 'Create',
          read: 'Read/View',
          update: 'Update',
          delete: 'Delete',
          export: 'Export',
          import: 'Import',
          send: 'Send',
          navigation: 'Navigation',
          crud: 'Data Changes',
          auth: 'Authentication',
          settings: 'Settings',
          financial: 'Financial',
          hr: 'HR Management',
          document: 'Documents',
          system: 'System'
        },
        results: {
          showing: 'Showing {{shown}} of {{total}} entries',
          filteredFrom: '(filtered from {{all}} total)',
          pageOf: 'Page {{current}} of {{total}}'
        },
        entry: {
          entity: 'Entity',
          previousValues: 'Previous Values',
          newValues: 'New Values',
          metadata: 'Metadata',
          entryId: 'Entry ID',
          userId: 'User ID',
          immutable: 'Immutable'
        },
        severity: {
          critical: 'critical',
          high: 'high',
          medium: 'medium',
          low: 'low'
        },
        empty: {
          noMatches: 'No audit entries found matching your criteria'
        },
        pagination: {
          first: 'First',
          last: 'Last'
        },
        confirm: {
          clearNow: 'Are you sure you want to clear the Activity Log? This cannot be undone.',
          clearAfterExport: 'Do you want to clear the Activity Log now? This cannot be undone.'
        }
      },
      team: {
        headerTitle: 'Team Management',
        headerSubtitle: "Manage your company's team members and permissions.",
        inviteButton: 'Invite Team Member',
        stats: {
          totalMembers: 'Total Members',
          activeMembers: 'Active Members',
          pendingInvites: 'Pending Invites',
          syncedToHR: 'Synced to HR',
          pendingSync: '{count} pending sync'
        },
        listTitle: 'Team Members',
        adminEmployeesOnly: 'Admin Employees Only',
        viewAdminUsersTooltip: 'View Administrative Users in Settings',
        goToAdminUsersTitle: 'Go to Administrative Users in Settings to manage this member',
        adminOnlyLinkedTitle: 'Only Admin or Primary users are linked to Administrative Users',
        empty: {
          noMembers: 'No team members found',
          inviteFirst: 'Invite your first team member to get started'
        },
        badges: {
          primary: 'Primary',
          lastActivePrefix: 'Last active:',
          fullAccess: 'Full Access'
        },
        permissions: {
          viewPages: '{count} Page(s)',
          writeCount: '{count} Write'
        },
        menu: {
          editAccess: 'Edit Access',
          deleteUser: 'Delete User'
        },
        authTarget: {
          user: 'User',
          userPermissions: 'User Permissions'
        },
        status: {
          active: 'Active',
          inactive: 'Inactive',
          invited: 'Invited'
        }
      }
      ,
      forms: {
        common: {
          notApplicable: 'Not Applicable',
          notSpecified: 'Not specified'
        },
        information: {
          nameLabel: 'Company Name',
          emailLabel: 'Email',
          phoneLabel: 'Phone',
          websiteLabel: 'Website'
        },
        address: {
          addressLabel: 'Address',
          line1Label: 'Address Line 1',
          line2Label: 'Address Line 2',
          line3Label: 'Address Line 3',
          line4Label: 'Address Line 4',
          line1Placeholder: 'Street number and name',
          line2Placeholder: 'Apartment, suite, building (optional)',
          line3Placeholder: 'District, suburb (optional)',
          line4Placeholder: 'City, postal code'
        },
        numbers: {
          regNumberLabel: 'Registration Number',
          vatNumberLabel: 'VAT Number',
          taxNumberLabel: 'Tax Number',
          csdRegistrationLabel: 'CSD Registration'
        },
        contact: {
          nameLabel: 'Name',
          surnameLabel: 'Surname',
          positionLabel: 'Position',
          selectPlaceholder: 'Select position'
        },
        positions: {
          ceo: 'CEO (Chief Executive Officer)',
          managingDirector: 'Managing Director (MD)',
          director: 'Director',
          founder: 'Founder',
          generalManager: 'General Manager (GM)',
          operationsManager: 'Operations Manager',
          financeManager: 'Finance Manager / CFO',
          bookkeeper: 'Bookkeeper'
        }
      }
    },
    // Clients
    clients: {
      title: 'Clients',
      addClient: 'Add Client',
      clientName: 'Client Name',
      company: 'Company',
      email: 'Email',
      phone: 'Phone',
      address: 'Address',
      status: 'Status',
      actions: 'Actions',
      manageClients: 'Manage your business clients and their information',
      searchPlaceholder: 'Search clients by name, email, or company',
      allStatus: 'All Status',
      allTypes: 'All Types',
      individual: 'Individual',
      business: 'Business',
      government: 'Government',
      active: 'Active',
      inactive: 'Inactive',
      overdue: 'Overdue',
      warning: 'Warning',
      atRisk: 'At-Risk',
      pending: 'Pending',
      totalValue: 'Total Value',
      lastActivity: 'Last Activity',
      totalClients: 'Total Clients',
      activeClients: 'Active Clients',
      overdueClients: 'Overdue Clients',
      clearFilters: 'Clear Filters',
      selected: 'selected',
      client: 'client',
      clients: 'clients',
      changeStatus: 'Change Status',
      deleteSelected: 'Delete Selected',
      clearSelection: 'Clear Selection',
      noClientsFound: 'No clients found',
      adjustSearchFilters: 'Try adjusting your search terms or filters',
      addFirstClient: 'Add Your First Client',
      noName: 'No Name',
      noCompany: 'No Company',
      failedToLoadClients: 'Failed to load clients:',
      errorCalculatingTotal: 'Error calculating client total value:',
      errorLoadingClients: 'Error loading clients:',
      invoicesUpdated: 'invoices-updated',
      paymentsUpdated: 'payments-updated'
    },
    // Quotations
    quotations: {
      title: 'Quotations',
      description: 'Create, manage, and track your quotations',
      createQuotation: 'Create Quotation',
      quotationNumber: 'Quotation Number',
      client: 'Client',
      date: 'Date',
      amount: 'Amount',
      status: 'Status',
      actions: 'Actions',
      // Table headers/labels
      table: {
        quotation: 'Quotation',
        client: 'Client',
        date: 'Date',
        amount: 'Amount',
        status: 'Status',
        salesperson: 'Salesperson',
        openMenu: 'Open menu'
      },
      
      // Stats cards
      stats: {
        totalQuotations: 'Total Quotations',
        totalValue: 'Total Value',
        conversionRate: 'Conversion Rate',
        averageValue: 'Average Value',
        accepted: 'Accepted',
        sent: 'Sent',
        viewed: 'Viewed',
        draft: 'Draft',
        expired: 'Expired',
        rejected: 'Rejected',
        desc: {
          allCreated: 'All quotations created',
          combinedValue: 'Combined quotation value',
          toSalesRatio: 'Quotations to sales ratio',
          avgAmount: 'Average quotation amount',
          totalAmount: '{{amount}} total',
          sentToClients: 'Sent to clients',
          seenByClients: 'Seen by clients',
          notYetSent: 'Not yet sent',
          pastExpiry: 'Past expiry date',
          declinedByClients: 'Declined by clients'
        }
      },
      // Search & quick filters
      search: {
        placeholder: 'Search quotations by number, client, or reference',
        advancedFilters: 'Advanced Filters',
        saveFilter: 'Save Filter',
        clearFilters: 'Clear Filters',
        recent: 'Recent:',
        statusSearchPlaceholder: 'Search status...',
        noStatusFound: 'No status found.',
        // Added for select dropdowns expecting these exact paths
        status: {
          all: 'All Status'
        },
        dates: {
          all: 'All Dates',
          today: 'Today',
          week: 'This Week',
          month: 'This Month',
          quarter: 'This Quarter',
          year: 'This Year'
        },
        allClients: 'All Clients',
        quick: {
          allStatus: 'All Status',
          allDates: 'All Dates',
          today: 'Today',
          thisWeek: 'This Week',
          thisMonth: 'This Month',
          thisQuarter: 'This Quarter',
          thisYear: 'This Year',
          allClients: 'All Clients'
        }
      },
      // Advanced filters panel
      filters: {
        title: 'Advanced Filters',
        dateRange: 'Date Range',
        dateType: {
          created: 'Created Date',
          expiry: 'Expiry Date',
          modified: 'Last Modified'
        },
        startDate: 'Start Date',
        endDate: 'End Date',
        amountRange: 'Amount Range',
        minAmount: 'Min Amount',
        maxAmount: 'Max Amount',
        salesperson: 'Salesperson',
        allSalespersons: 'All Salespersons',
        tags: 'Tags',
        customFields: 'Custom Fields',
        department: 'Department',
        allDepartments: 'All Departments',
        region: 'Region',
        allRegions: 'All Regions',
        regions: {
          westernCape: 'Western Cape',
          gauteng: 'Gauteng',
          kwazuluNatal: 'KwaZulu-Natal'
        },
        infoActiveApplied: 'Active filters will be applied to the quotations list',
        reset: 'Reset Filters',
        apply: 'Apply Filters'
      },
      // Pagination controls
      pagination: {
        show: 'Show:',
        perPage: 'per page',
        showingRange: 'Showing {{start}}-{{end}} of {{total}} quotations',
        pageXofY: 'Page {{current}} of {{total}}',
        firstPage: 'First page',
        previousPage: 'Previous page',
        nextPage: 'Next page',
        lastPage: 'Last page',
        goToPage: 'Go to page {{page}}'
      },
      // Header
      header: {
        refresh: 'Refresh'
      },
      // Actions
      sendQuotation: 'Send Quotation',
      editQuotation: 'Edit Quotation',
      downloadQuotation: 'Download Quotation',
      convertToInvoice: 'Convert to Invoice',
      generatingPDF: 'Generating PDF...',
      converting: 'Converting... ',
      markAsAccepted: 'Mark as Accepted',
      markAsRejected: 'Mark as Rejected',
      downloadPDF: 'Download PDF',
      duplicate: 'Duplicate',
      // Status labels
      statusLabels: {
        draft: 'Draft',
        saved: 'Saved',
        sent: 'Sent',
        viewed: 'Viewed',
        accepted: 'Accepted',
        rejected: 'Rejected',
        expired: 'Expired',
        cancelled: 'Cancelled'
      },
      // Dialogs & toasts
      dialogs: {
        deleteTitle: 'Delete Quotation',
        deleteDescription: 'Are you sure you want to delete this quotation? This action cannot be undone.',
        cancel: 'Cancel',
        confirmDelete: 'Delete',
        sendTitle: 'Send Quotation',
        sendDescription: 'Send quotation {{number}} to {{email}}?',
        sendConfirm: 'Send'
      },
      toasts: {
        deleted: 'Quotation deleted successfully',
        sent: 'Quotation sent to {{email}}',
        convertedToInvoice: 'Quotation converted to invoice successfully',
        convertFailed: 'Failed to convert quotation to invoice',
        pdfFailed: 'Failed to generate PDF. Please try again.',
        statusUpdated: 'Status updated',
        statusUpdateFailed: 'Failed to update status'
      }
    },
    // Invoices
    invoices: {
      title: 'Invoices',
      description: 'Create, manage, and track your invoices and payments',
      createInvoice: 'Create Invoice',
      invoiceNumber: 'Invoice Number',
      client: 'Client',
      date: 'Date',
      dueDate: 'Due Date',
      amount: 'Amount',
      status: 'Status',
      actions: 'Actions',
      receivePayment: 'Receive Payment',
      recordPaymentTooltip: 'Record payment for selected invoice',
      selectInvoiceToRecordPayment: 'Select an invoice to record payment'
      ,
      // UI labels
      searchPlaceholder: 'Search invoices...',
      tableView: 'Table',
      gridView: 'Grid',
      newInvoiceButton: 'New Invoice',
      allClients: 'All Clients',
      // Summary cards
      summary: {
        totalInvoiced: 'Total Invoiced',
        outstandingBalance: 'Outstanding Balance',
        overdueAmount: 'Overdue Amount',
        paidThisPeriod: 'Paid This Period',
        vsLastPeriod: 'vs last period'
      },
      // Filters
      filters: {
        label: 'Filters',
        status: 'Status',
        dateRange: 'Date Range',
        allStatuses: 'All Statuses',
        clearAll: 'Clear all filters',
        clear: 'Clear',
        saveFilter: 'Save Filter',
        more: 'More Filters',
        advanced: 'Advanced Filters',
        amountRange: 'Amount Range',
        min: 'Min',
        max: 'Max',
        allDates: 'All Dates',
        today: 'Today',
        thisWeek: 'This Week',
        customRange: 'Custom Range',
        dateAllTime: 'All Time',
        dateThisMonth: 'This Month',
        dateLastMonth: 'Last Month',
        dateThisQuarter: 'This Quarter',
        dateLastQuarter: 'Last Quarter',
        dateThisYear: 'This Year'
      },
      // Status display labels
      statusLabels: {
        draft: 'Draft',
        sent: 'Sent',
        viewed: 'Viewed',
        partial: 'Partial',
        unpaid: 'Unpaid',
        paid: 'Paid',
        overdue: 'Overdue',
        cancelled: 'Cancelled'
      },
      // Table and actions
      vatAmount: 'VAT Amount',
      table: {
        openMenu: 'Open menu'
      },
      actionLabels: {
        view: 'View',
        edit: 'Edit',
        send: 'Send',
        duplicate: 'Duplicate',
        recordPayment: 'Record Payment',
        delete: 'Delete'
      },
      empty: {
        noInvoices: 'No invoices found.',
        createFirst: 'Create your first invoice to get started.'
      },
      dialogs: {
        deleteTitle: 'Delete Invoice',
        deleteDescription: 'Are you sure you want to delete this invoice? This action cannot be undone.',
        cancel: 'Cancel',
        confirmDelete: 'Delete'
      },
      toasts: {
        deleted: 'Invoice deleted successfully',
        statusUpdated: 'Invoice status updated',
        selectOneToRecord: 'Please select an invoice to record payment',
        selectOnlyOneToRecord: 'Please select only one invoice to record payment',
        paymentRecorded: 'Payment recorded successfully'
      }
    },
    // Projects
    projects: {
      title: 'Projects',
      description: 'Manage and track all your projects',
      createProject: 'Create Project',
      newProjectButton: 'New Project',
      projectName: 'Project Name',
      client: 'Client',
      manager: 'Manager',
      startDate: 'Start Date',
      endDate: 'End Date',
      schedule: 'Schedule',
      ongoing: 'Ongoing',
      status: 'Status',
      progress: 'Progress',
      actions: 'Actions',
      searchPlaceholder: 'Search projects by name, client, or reference',
      filters: {
        label: 'Filters',
        allStatuses: 'All Statuses'
      },
      sort: {
        name: 'Project Name',
        client: 'Client',
        progress: 'Progress',
        budget: 'Budget',
        startDate: 'Start Date',
        endDate: 'End Date'
      },
      statusLabels: {
        inProgress: 'In Progress',
        completed: 'Completed',
        planning: 'Planning',
        onHold: 'On Hold',
        cancelled: 'Cancelled',
        ongoing: 'Ongoing'
      },
      stats: {
        totalProjects: 'Total Projects',
        active: 'Active',
        completed: 'Completed',
        overdue: 'Overdue',
        budget: 'Budget',
        expenses: 'Expenses',
        profit: 'Profit'
      },
      grid: {
        client: 'Client:',
        manager: 'Manager:',
        start: 'Start:',
        end: 'End:',
        projectProgress: 'Project Progress',
        tasksLabel: 'Tasks',
        noTasks: 'No tasks',
        updatedAutomatically: 'Updated automatically',
        budget: 'Budget',
        expenses: 'Expenses',
        empty: 'No projects found'
      },
      actionsBar: {
        selectedCount: '{{count}} selected',
        edit: 'Edit',
        delete: 'Delete'
      },
      actionLabels: {
        view: 'View',
        edit: 'Edit',
        viewDetails: 'View Details',
        editProject: 'Edit Project',
        cancelProject: 'Cancel Project'
      },
      dialog: {
        cancelTitle: 'Cancel {{name}}?',
        cancelDescription: 'This action will mark the project as cancelled and cannot be easily undone. All associated data will be retained but the project will no longer appear in active projects.',
        cancel: 'Cancel',
        confirmCancel: 'Cancel Project'
      }
    },
    // Inventory
    inventory: {
      title: 'Inventory',
      addItem: 'Add Item',
      itemName: 'Item Name',
      category: 'Category',
      quantity: 'Quantity',
      price: 'Price',
      status: 'Status',
      actions: 'Actions',
      trackManageOptimize: 'Track, manage, and optimize your inventory',
      newStock: 'New Stock',
      updateStock: 'Update Stock',
      scanBarcode: 'Scan Barcode',
      addSupplier: 'Add Supplier',
      addStorage: 'Add Storage',
      sales: 'Sales',
      searchByName: 'Search by name, ID, barcode, supplier, description...',
      filterByCategory: 'Filter by Category',
      filterByStatus: 'Filter by Status',
      allCategories: 'All Categories',
      allStatuses: 'All Statuses',
      generateReports: 'Generate Reports',
      reports: 'Reports',
      inventoryItems: 'Inventory Items',
      allStock: 'All Stock',
      lowStock: 'Low Stock',
      expiringSoon: 'Expiring Soon',
      damaged: 'Damaged',
      history: 'History',
      refresh: 'Refresh',
      loadingInventoryData: 'Loading inventory data...',
      failedToLoadInventoryData: 'Failed to load inventory data',
      stockHistory: 'Stock History',
      noStockHistoryAvailable: 'No stock history available',
      date: 'Date',
      itemId: 'Item ID',
      type: 'Type',
      notes: 'Notes',
      performedBy: 'Performed By',
      deleteConfirmation: 'Are you sure you want to delete this item?',
      youAreAboutToDelete: 'You are about to delete:',
      thisActionCannotBeUndone: 'This action cannot be undone.',
      cancel: 'Cancel',
      delete: 'Delete',
      itemHistory: 'Item History',
      viewingHistoryFor: 'Viewing history for {{name}} (ID: {{id}})',
      noHistoryRecords: 'No history records found for this item',
      close: 'Close',
      editItemDetails: 'Edit Item Details',
      updateDetailsFor: 'Update the details for {{name}}',
      addedToInvoice: 'Added to invoice',
      addedToQuotation: 'Added to quotation',
      hasBeenAddedTo: '{{itemName}} has been added to your {{type}}',
      itemDeleted: 'Item Deleted',
      hasBeenRemovedFromInventory: '{{itemName}} has been removed from inventory',
      error: 'Error',
      failedToDeleteItem: 'Failed to delete item',
      errorOccurredWhileDeleting: 'An error occurred while deleting the item',
      refreshed: 'Refreshed',
      inventoryDataRefreshed: 'Inventory data has been refreshed from storage',
      stockUpdated: 'Stock Updated',
      stockUpdatedSuccessfully: '{{itemName}} stock has been updated successfully.',
      // Empty state
      noInventoryItemsFound: 'No inventory items found',
      tryAdjustingFiltersOrAddNewStock: 'Try adjusting filters or add new stock',
      // Table headers and fields
      itemIdHeader: 'Item ID',
      item: 'Item',
      stock: 'Stock',
      location: 'Location',
      lastUpdated: 'Last Updated',
      barcode: 'Barcode',
      // Status badges
      inStock: 'In Stock',
      outOfStock: 'Out of Stock',
      expiredLabel: 'Expired',
      // Menus and actions
      openMenu: 'Open menu',
      updateStockLabel: 'Update Stock',
      editDetails: 'Edit Details',
      addToInvoice: 'Add to Invoice',
      addToQuotation: 'Add to Quotation',
      viewHistory: 'View History',
      reportDamageExpired: 'Report Damage/Expired'
    },
    // HR Management
    hr: {
      title: 'HR Management',
      subtitle: 'Manage employees, payroll, and human resources',
      // Tabs
      hrmDashboard: 'HRM Dashboard',
      employees: 'Employees',
      employeeDirectory: 'Employee Directory',
      leaveManagement: 'Leave Management',
      timeAndAttendance: 'Time & Attendance',
      training: 'Training',
      performance: 'Performance',
      disciplinary: 'Disciplinary',
      allowance: 'Allowance',
      payroll: 'Payroll',
      // Metrics
      totalEmployees: 'Total Employees',
      newHires: 'New Hires',
      thisMonth: 'This month',
      onLeaveToday: 'On Leave Today',
      birthdays: 'Birthdays',
      thisWeek: 'This week',
      openPositions: 'Open Positions',
      turnoverRate: 'Turnover Rate',
      belowTarget: 'Below target',
      // Quick Actions
      quickActions: 'Quick Actions',
      addEmployee: 'Add Employee',
      approveLeave: 'Approve Leave',
      employeeName: 'Employee Name',
      position: 'Position',
      department: 'Department',
      salary: 'Salary',
      status: 'Status',
      actions: 'Actions'
    },
    // Accounting
    accounting: {
      title: 'Accounting',
      overview: 'Financial Overview',
      income: 'Income',
      expenses: 'Expenses',
      profit: 'Profit',
      reports: 'Reports',
      transactions: 'Transactions',
      // Page
      subtitle: 'Manage your business finances, expenses, and financial documents',
      tax: 'Tax',
      // Cards
      totalRevenue: 'Total Revenue',
      totalExpenses: 'Total Expenses',
      netProfit: 'Net Profit',
      outstanding: 'Outstanding',
      pendingPayments: 'pending payments',
      // Overview sections
      recentTransactions: 'Recent Transactions',
      financialSummary: 'Financial Summary',
      monthlyRevenue: 'Monthly Revenue',
      monthlyExpenses: 'Monthly Expenses',
      taxLiability: 'Tax Liability',
      netIncome: 'Net Income',
      vsLastMonth: 'vs last month',
      noRecentTransactions: 'No recent transactions found',
      addSomeExpensesOrIncome: 'Add some expenses or income to see them here'
    },
    // Settings
    settings: {
      title: 'Settings',
      sidebar: {
        general: 'General',
        security: 'Security',
        notifications: 'Notifications',
        billing: 'Billing & Subscription',
        financial: 'Financial',
        reporting: 'Reporting & Analytics',
        localization: 'Localization',
        advanced: 'Advanced'
      },
      tabs: {
        general: 'General',
        users: 'Users',
        security: 'Security',
        notifications: 'Notifications',
        data: 'Data',
        mobile: 'Mobile',
        billing: 'Billing',
        help: 'Help',
        about: 'About',
        reports: 'Reports',
        dataSecurity: 'Data Security',
        maintenance: 'Maintenance'
      },
      // Aliases for commonly used Settings keys (to match UI components)
      description: 'Configure your application preferences',
      companyInformation: 'Company Information',
      companyName: 'Company Name',
      businessType: 'Business Type',
      industry: 'Industry',
      registrationNumber: 'Registration Number',
      vatNumber: 'VAT Number',
      companyLogo: 'Company Logo',
      physicalAddress: 'Physical Address',
      mailingAddress: 'Mailing Address',
      displaySettings: 'Display Settings',
      theme: 'Theme',
      fontSize: 'Font Size',
      themeLight: 'Light',
      themeDark: 'Dark',
      themeAuto: 'Auto',
      fontSmall: 'Small',
      fontMedium: 'Medium',
      fontLarge: 'Large',
      defaultLanguage: 'Default Language',
      timezone: 'Timezone',
      currency: 'Currency',
      general: {
        title: 'General Settings',
        description: 'Configure your application preferences',
        companyInformation: 'Company Information',
        companyName: 'Company Name',
        businessType: 'Business Type',
        industry: 'Industry',
        registrationNumber: 'Registration Number',
        vatNumber: 'VAT Number',
        physicalAddress: 'Physical Address',
        mailingAddress: 'Mailing Address',
        companyLogo: 'Company Logo',
        displaySettings: 'Display Settings',
        theme: 'Theme',
        fontSize: 'Font Size',
        themeLight: 'Light',
        themeDark: 'Dark',
        themeAuto: 'Auto',
        fontSmall: 'Small',
        fontMedium: 'Medium',
        fontLarge: 'Large'
      },
      localization: {
        title: 'Localization',
        description: 'Set your language, date, and time preferences',
        defaultLanguage: 'Default Language',
        dateFormat: 'Date Format',
        timeFormat: 'Time Format',
        timezone: 'Timezone',
        currency: 'Currency',
        firstDayOfWeek: 'First Day of Week',
        numberFormat: 'Number Format',
        measurementUnits: 'Measurement Units'
      },

      billing: {
        title: 'Billing & Subscription',
        subtitle: 'Manage your subscription, payment methods and billing history',
        tabs: {
          overview: 'Overview',
          plans: 'Plans',
          billing: 'Billing'
        },
        status: {
          trial: 'Trial',
          active: 'Active',
          paymentIssue: 'Payment Issue',
          expired: 'Expired',
          canceled: 'Canceled'
        },
        tiers: {
          free: 'Free',
          basic: 'Basic',
          premium: 'Premium',
          enterprise: 'Enterprise'
        },
        planDescriptions: {
          free: 'Basic financial management tools',
          basic: 'Essential tools for small businesses',
          premium: 'Advanced tools for growing businesses',
          enterprise: 'Complete solution for established businesses'
        },
        // Overview section used by OverviewTab
        overview: {
          title: 'Subscription Overview',
          description: 'Your current plan and billing status',
          currentPlan: 'Current Plan',
          status: 'Status',
          nextBillingDate: 'Next billing date',
          trialEndsIn: 'Trial ends',
          daysLeft: '{{count}} days left',
          cancelSubscription: 'Cancel subscription',
          upgradePlan: 'Upgrade plan'
        },
        // Section headings and labels used in BillingSubscriptionTab
        subscriptionStatus: 'Subscription Status',
        subscriptionDetails: 'Your subscription details',
        trialPeriod: 'Trial Period',
        trialDaysLeft: '{{days}} days left',
        trialEndingSoon: 'Trial ending soon',
        trialCanceled: 'You Cancelled the Trial',
        trialCanceledDaysLeft: '{{days}} days left',
        paymentIssue: 'Payment Issue',
        paymentIssueDesc: 'We had trouble processing your last payment. Please update your payment method.',
        updatePaymentMethod: 'Update payment method',
        currentPlan: 'Current Plan',
        billingCycle: 'Billing cycle',
        monthly: 'Monthly',
        startDate: 'Start date',
        nextBillingDate: 'Next billing date',
        cancelSubscription: 'Cancel subscription',
        viewPlans: 'View plans',

        // Payment method card
        paymentMethod: 'Payment Method',
        managePayment: 'Manage your payment details',
        cardMasked: 'Card ending in {{last4}}',
        cardExpires: 'Expires {{expiry}}',
        update: 'Update',
        noPaymentMethod: 'No payment method on file',
        addPaymentMethod: 'Add payment method',

        // Plan cards
        currentPlanBadge: 'Current Plan',
        selectPlan: 'Select Plan',

        // Payment history table
        paymentHistory: 'Payment History',
        viewRecentPayments: 'View your recent payments',
        table: {
          date: 'Date',
          description: 'Description',
          amount: 'Amount',
          status: 'Status'
        },
        paid: 'Paid',
        failed: 'Failed',
        noPaymentHistory: 'No payment history found',

        // Billing info panel
        billingInfo: 'Billing Information',
        manageBilling: 'Manage your billing profile',
        companyInfo: 'Company Information',
        billingContact: 'Billing Contact',
        updateContact: 'Update Contact',

        // Update payment method sheet
        cardNumber: 'Card Number',
        expiryDate: 'Expiry Date',
        cvc: 'CVC',
        nameOnCard: 'Name on Card',
        savePaymentMethod: 'Save payment method',
        paymentSecurityNote: 'Payments are processed securely. We never store full card details.',

        // Toasts
        toasts: {
          upgradeRequestedTitle: 'Upgrade requested',
          upgradeRequestedDesc: 'We will process your request to upgrade to {{tier}} shortly',
          canceledTitle: 'Subscription canceled',
          canceledDesc: 'Your subscription has been canceled',
          retryTitle: 'Retry payment',
          retryDesc: 'Please try your payment again',
          paymentUpdatedTitle: 'Payment method updated',
          paymentUpdatedDesc: 'Your payment method has been updated successfully'
        },

        // Plans and History tabs
        plans: {
          title: 'Plans & Pricing',
          description: 'Choose the plan that fits your needs'
        },
        history: {
          title: 'Billing History',
          description: 'Your invoices and payment records'
        },

        // Plan feature bullets
        planFeatureDescription: 'Everything included in {{tier}}',
        features: {
          free: {
            basicInvoicing: 'Basic invoicing',
            upToClients: 'Up to 10 clients',
            upToDocuments: 'Up to 25 documents'
          },
          basic: {
            unlimitedInvoices: 'Unlimited invoices',
            upToClients: 'Up to 50 clients',
            upToDocuments: 'Up to 200 documents',
            exportReports: 'Export reports',
            bulkInvoicing: 'Bulk invoicing'
          },
          premium: {
            everythingInBasic: 'Everything in Basic',
            unlimitedClients: 'Unlimited clients',
            unlimitedDocuments: 'Unlimited documents',
            advancedReporting: 'Advanced reporting & analytics',
            customBranding: 'Custom branding',
            teamMembersUpTo3: 'Team members (up to 3)'
          },
          enterprise: {
            everythingInPremium: 'Everything in Premium',
            apiAccess: 'API access',
            unlimitedTeamMembers: 'Unlimited team members',
            prioritySupport: 'Priority support',
            customIntegrations: 'Custom integrations'
          }
        }
      },
      help: {
        title: 'Help & Support',
        intro: 'Get assistance, explore resources, or troubleshoot common issues.',
        buttons: {
          emailSupport: 'Email Support',
          contactPage: 'Contact Page',
          website: 'Website',
          copyDiagnostics: 'Copy diagnostics',
          enableAutoClean: 'Enable Auto-clean stuck toasts',
          disableAutoClean: 'Disable Auto-clean stuck toasts',
          forceCleanupNow: 'Force cleanup now',
          checkNetwork: 'Check network',
          clearAppCache: 'Clear app cache',
          resetAuthReload: 'Reset auth & reload'
        },
        stats: {
          status: 'Status',
          online: 'Online',
          offline: 'Offline',
          storageKeys: 'Storage Keys',
          localDataSize: 'Local Data Size'
        },
        troubleshooting: 'Troubleshooting',
        contextual: {
          heading: '{{title}} — Tips & Guidance',
          generic: 'General help and diagnostics. Navigate to a module for more specific tips.',
          company: {
            p1: 'Manage company profile and sync details to HR employees.',
            li1: 'Update company details in Company Details and save.',
            li2: 'Use Team Management to manage admins. Auto-sync will reflect in HR → Employees.',
            li3: 'Check console for sync messages like "Synced team member ... to employees" or warnings about duplicates.',
            li4: 'If you see duplicate/exists errors, open HR and run cleanup tools if needed.'
          },
          clients: {
            p1: 'Track clients and their activity across invoices and payments.',
            li1: 'Use the Add Client button to create records; edits and deletes are logged to console.',
            li2: 'Filter and sort using the header controls; bulk actions are available where applicable.',
            li3: 'Status is computed from recent activity and invoice balances; see console diagnostics for calculations.'
          },
          quotations: {
            p1: 'Create, preview, and send quotations with VAT and discounts.',
            li1: 'Add line items with quantity, rate, tax, and discount.',
            li2: 'Use Preview to review client details and totals before sending.',
            li3: 'Console logs show processed items and selected client mapping for debugging.',
            li4: 'VAT is calculated per line and summarized; verify totals against console outputs.'
          },
          invoices: {
            p1: 'Generate invoices and downloadable PDFs with client and company branding.',
            li1: 'Select a client, add items, confirm subtotal, VAT, and grand total.',
            li2: 'Download or preview PDFs; console logs capture creation and PDF events.',
            li3: 'Logo, signature, and stamp positions are configurable in settings or branding sections.'
          },
          projects: {
            p1: 'Manage projects and track expense totals via attendance sync.',
            li1: 'Create/update projects; updates are reflected in totals with sync messages in console.',
            li2: 'Periodic sync updates will log events like "Projects: Received sync update".'
          },
          inventory: {
            p1: 'Maintain product/service catalog for use in quotations and invoices.',
            li1: 'Add or edit items with SKU, price, and tax settings.',
            li2: 'Console logs focus on data retrieval and any sync operations.'
          },
          hr: {
            p1: 'Handle employees, attendance, and payroll calculations.',
            li1: 'Use the cleanup tool to remove sample employees if needed.',
            li2: 'Verify active employees count excludes Regular User; see console metrics for details.'
          },
          accounting: {
            p1: 'Review bank statements, expenses mapping, and VAT/EMP201 flows.',
            li1: 'Ensure statements load from localStorage; logs show counts and sample entries.',
            li2: 'Recharts warnings are informational; consider ResponsiveContainer for dynamic sizing.'
          },
          settings: {
            p1: 'Configure users, security, data, reports, and more.',
            li1: 'Use Users tab for admin management; deep links like #admin-users will auto-scroll.',
            li2: 'Diagnostics: copy environment details and check network connectivity from this Help tab.'
          }
        },
        faqs: {
          title: 'Frequently Asked Questions',
          q1: 'How do I contact support?',
          a1: 'Use the Email Support button above or write to support@mokmzansibooks.com. Include screenshots and steps to reproduce the issue.',
          q2: 'How do I clear stuck loading spinners?',
          a2: 'Use "Force cleanup now" to dismiss any stuck toasts and spinners. You can also enable Auto-clean to run periodically in the background.',
          q3: 'Will clearing app cache log me out?',
          a3: 'Clearing cache removes local data and may sign you out. You can sign back in or use the Reset auth action to recreate default test accounts.'
        },
        toasts: {
          diagnosticsCopiedTitle: 'Diagnostics copied',
          diagnosticsCopiedDesc: 'Details copied to clipboard. Paste into your support message.',
          copyFailedTitle: 'Copy failed',
          copyFailedDesc: 'Clipboard access was blocked by your browser.',
          networkOkTitle: 'Network looks good',
          networkOkDesc: 'Your browser is online and the app is reachable.',
          networkIssueTitle: 'Network issue detected',
          networkIssueDesc: 'We could not reach the app origin. Check your connection.',
          autoCleanEnabledTitle: 'Auto-clean enabled',
          autoCleanEnabledDesc: 'We will periodically remove stuck syncing toasts.',
          autoCleanDisabledTitle: 'Auto-clean disabled',
          autoCleanDisabledDesc: 'Periodic cleanup has been stopped.',
          cacheClearedTitle: 'Cache cleared',
          cacheClearedDesc: 'Local data cleared successfully. Reloading…',
          cacheClearFailedTitle: 'Failed to clear cache',
          cacheClearFailedDesc: 'Please try again or contact support.'
        },
        confirms: {
          clearCache: 'This will clear local application data and may sign you out. Continue?',
          resetAuth: 'Reset local authentication and reload? Default accounts will be recreated.'
        },
        mail: {
          subject: 'Support Request - MOK Mzansi Books',
          body: 'Describe your issue here...\n\n(You can paste diagnostics you copied here)'
        }
      },
      about: {
        title: 'About MOK Mzansi Books',
        intro: 'MOK Mzansi Books is an all-in-one business suite designed to simplify operations, from invoicing to reporting, with a focus on a delightful and efficient user experience.',
        labels: {
          version: 'Version',
          environment: 'Environment',
          buildTime: 'Build Time',
          systemInformation: 'System Information'
        },
        buttons: {
          copyDiagnostics: 'Copy diagnostics',
          checkForUpdates: 'Check for updates',
          contactSupport: 'Contact support',
          website: 'Website'
        },
        resources: {
          title: 'Resources & Legal',
          privacy: 'Privacy Policy',
          privacyDesc: 'Learn how we handle your data',
          terms: 'Terms of Service',
          termsDesc: 'Read the terms for using this app'
        },
        toasts: {
          diagnosticsCopiedTitle: 'Diagnostics copied',
          diagnosticsCopiedDesc: 'System details have been copied to your clipboard.',
          copyFailedTitle: 'Unable to copy',
          copyFailedDesc: 'Your browser blocked clipboard access. Please try again.',
          upToDateTitle: 'You are up to date',
          upToDateDesc: 'Running {{version}}. No updates available right now.'
        }
      },

      security: {
        title: 'Security Settings',
        // Password
        passwordSecurity: 'Password Security',
        requireStrongPasswords: 'Require Strong Passwords',
        enforcePasswordComplexity: 'Enforce password complexity requirements',
        requirementsTitle: 'Password Requirements:',
        min8: 'Minimum 8 characters',
        uppercase: 'Uppercase letters (A-Z)',
        lowercase: 'Lowercase letters (a-z)',
        numbers: 'Numbers (0-9)',
        specialChars: 'Special characters (!@#$%^&*)',
        expiryDaysLabel: 'Password Expiry (Days)',
        expiry30: '30 days',
        expiry60: '60 days',
        expiry90: '90 days',
        expiry180: '180 days',
        expiry365: '365 days',
        expiryHelp: 'Users will be required to change their password after this period',
        // 2FA
        twoFactor: 'Two-Factor Authentication',
        enableTwoFactor: 'Enable Two-Factor Authentication',
        twoFactorDesc: 'Require a verification code in addition to passwords for login',
        twoFactorEnabledInfo: 'Two-factor authentication is enabled. Users will be prompted to set up 2FA using an authenticator app when they next sign in.',
        // Session
        sessionSecurity: 'Session Security',
        sessionTimeoutMinutes: 'Session Timeout (Minutes)',
        timeout15: '15 minutes',
        timeout30: '30 minutes',
        timeout60: '1 hour',
        timeout120: '2 hours',
        timeout240: '4 hours',
        autoLogoutHelp: 'Users will be automatically logged out after this period of inactivity',
        loginNotifications: 'Login Notifications',
        loginNotificationsDesc: 'Send email notifications for new logins',
        // Devices
        activeDevices: 'Active Devices',
        currentDevice: 'Current',
        // Buttons
        saveSettings: 'Save Settings',
        saving: 'Saving...',
        // Toasts
        savedTitle: 'Security settings saved successfully',
        savedDesc: 'Your security preferences have been updated.',
        errorTitle: 'Error',
        saveErrorDesc: 'Failed to save settings. Please try again.',
        deviceLoggedOutTitle: 'Device logged out',
        deviceLoggedOutDesc: 'The device has been successfully logged out.',
        deviceLogoutErrorTitle: 'Error',
        deviceLogoutErrorDesc: 'Could not logout the selected device.'
      },
      notifications: {
        // Section titles
        emailNotifications: 'Email Notifications',
        inAppNotifications: 'In-App Notifications',
        notificationFrequency: 'Notification Frequency',
        // Email section
        enableEmail: 'Enable Email Notifications',
        receiveViaEmail: 'Receive notifications via email',
        emailAddress: 'Email Address',
        invoiceReminders: 'Invoice Reminders',
        paymentDueReminders: 'Payment due reminders',
        paymentReceived: 'Payment Received',
        paymentConfirmations: 'Payment confirmations',
        lowStockAlerts: 'Low Stock Alerts',
        inventoryWarnings: 'Inventory warnings',
        systemAlerts: 'System Alerts',
        systemMessages: 'Important system messages',
        // In-app section
        enableSound: 'Enable Sound',
        playNotificationSounds: 'Play notification sounds',
        desktopNotifications: 'Desktop Notifications',
        showBrowserNotifications: 'Show browser notifications',
        permissionNotGranted: 'Permission not granted yet.',
        grantPermission: 'Grant permission',
        desktopEnabled: 'Desktop notifications enabled',
        permissionDenied: 'Permission denied in browser settings',
        newInvoices: 'New Invoices',
        invoiceCreationAlerts: 'Invoice creation alerts',
        taskReminders: 'Task Reminders',
        upcomingTaskNotifications: 'Upcoming task notifications',
        // Frequency section
        invoiceReminderLabel: 'Invoice Reminder (days before due)',
        reportSchedule: 'Report Schedule',
        digestFrequency: 'Digest Frequency',
        day1: '1 day',
        days3: '3 days',
        days7: '7 days',
        days14: '14 days',
        realtime: 'Real-time',
        daily: 'Daily',
        weekly: 'Weekly',
        monthly: 'Monthly',
        // Buttons & toasts
        save: 'Save Notification Settings',
        saveSuccess: 'Notification settings saved successfully!',
        saveError: 'Failed to save notification settings'
      },
      mobile: {
        // Sections
        deviceInfoTitle: 'Device Information',
        scannerTitle: 'Barcode Scanner Settings',
        layoutTitle: 'Layout & Interface',
        accessibilityTitle: 'Accessibility',
        pwaTitle: 'Progressive Web App',
        // Device info
        deviceType: 'Device Type',
        deviceTypeMobile: 'Mobile',
        deviceTypeDesktop: 'Desktop',
        touchSupport: 'Touch Support',
        yes: 'Yes',
        no: 'No',
        screenSize: 'Screen Size',
        pwaMode: 'PWA Mode',
        pwaInstalled: 'Installed',
        pwaBrowser: 'Browser',
        // Scanner
        cameraPermission: 'Camera Permission',
        cameraRequired: 'Required for barcode scanning',
        grantAccessBtn: 'Grant Access',
        permissionGranted: 'granted',
        permissionDenied: 'denied',
        permissionPrompt: 'prompt',
        permissionUnknown: 'unknown',
        fps: 'Frames Per Second',
        fps5Label: '5 FPS (Power Saving)',
        fps10Label: '10 FPS (Balanced)',
        fps15Label: '15 FPS (Fast)',
        fps30Label: '30 FPS (High Performance)',
        scanAreaSize: 'Scan Area Size',
        small150: 'Small (150px)',
        medium200: 'Medium (200px)',
        large250: 'Large (250px)',
        xlarge300: 'Extra Large (300px)',
        preferredCamera: 'Preferred Camera',
        rearCamera: 'Rear Camera',
        frontCamera: 'Front Camera',
        cameraId: 'Camera {{id}}',
        aspectRatio: 'Aspect Ratio',
        square: 'Square (1:1)',
        standard43: 'Standard (4:3)',
        widescreen169: 'Widescreen (16:9)',
        scanBeep: 'Scan Beep Sound',
        audioFeedback: 'Audio feedback on scan',
        vibrationFeedback: 'Vibration Feedback',
        hapticFeedbackDesc: 'Haptic feedback on scan',
        testVibration: 'Test',
        disableFlip: 'Disable Image Flip',
        preventMirror: 'Prevent mirror effect',
        // Scanner Test UI
        testScannerTitle: 'Test Scanner',
        startTestBtn: 'Start Test',
        testScannerHint: 'Click "Start Test" to test the barcode scanner',
        stopTestBtn: 'Stop Test',
        // Layout
        compactMode: 'Compact Mode',
        reducedSpacing: 'Reduced spacing for mobile',
        largeTouchButtons: 'Large Touch Buttons',
        biggerButtons: 'Bigger buttons for touch',
        optimizeForTouch: 'Optimize for Touch',
        touchFriendly: 'Touch-friendly interactions',
        autoHideSidebar: 'Auto-hide Sidebar',
        moreScreenSpace: 'More screen space',
        // Accessibility
        hapticFeedback: 'Haptic Feedback',
        systemVibrations: 'System vibrations',
        highContrastMode: 'High Contrast Mode',
        betterVisibility: 'Better visibility',
        reducedMotion: 'Reduced Motion',
        minimizeAnimations: 'Minimize animations',
        voiceAssistance: 'Voice Assistance',
        screenReaderSupport: 'Screen reader support',
        // PWA
        installApp: 'Install App',
        installDesc: 'Add MOK Mzansi Books to your home screen for quick access.',
        installNow: 'Install Now',
        shareApp: 'Share App',
        shareDesc: 'Share MOK Mzansi Books with colleagues and friends.',
        shareButton: 'Share App',
        autoInstallPrompt: 'Auto Install Prompt',
        suggestInstall: 'Suggest app installation',
        offlineMode: 'Offline Mode',
        workOffline: 'Work without internet',
        backgroundSync: 'Background Sync',
        syncWhenOnline: 'Sync when online',
        pushNotifications: 'Push Notifications',
        receiveMobileNotifications: 'Receive mobile notifications',
        enableBtn: 'Enable',
        // Toasts
        toasts: {
          cameraGrantedTitle: 'Camera Access Granted',
          cameraGrantedDesc: 'You can now use the barcode scanner',
          cameraDeniedTitle: 'Camera Access Denied',
          cameraDeniedDesc: 'Please enable camera access in your browser settings',
          notificationsEnabledTitle: 'Notifications Enabled',
          vibrationTestTitle: 'Vibration Test',
          vibrationTestDesc: 'Did you feel the vibration?',
          vibrationNotSupportedTitle: 'Vibration Not Supported',
          vibrationNotSupportedDesc: 'Your device does not support vibration',
          appInstalledTitle: 'App Installed',
          appInstalledDesc: 'MOK Mzansi Books has been added to your home screen',
          linkCopiedTitle: 'Link Copied',
          linkCopiedDesc: 'App link copied to clipboard',
          shareNotSupportedTitle: 'Share Not Supported',
          shareNotSupportedDesc: 'Web Share API not available on this device'
        }
      },
      dataManagement: {
        title: 'Data Management',
        storageUsage: 'Local Storage Usage',
        refresh: 'Refresh',
        ofMb: '{{used}} KB of {{total}} MB',
        keysCount: '{{count}} keys',
        usedStorage: 'Used Storage',
        dataCategories: '{{count}} data categories',
        usedPercent: '{{percent}}% used',
        exportTitle: 'Export Data',
        exportDesc: 'Download a JSON backup of your application data.',
        exportButton: 'Export Data',
        exporting: 'Exporting...',
        exportSuccessTitle: 'Export successful',
        exportSuccessDesc: 'Data export created successfully',
        exportFailedTitle: 'Export failed',
        exportFailedDesc: 'Failed to export data',
        importTitle: 'Import Data',
        importDesc: 'Restore data from a previously exported JSON file.',
        importButton: 'Import Data',
        importing: 'Importing...',
        importSuccessTitle: 'Import successful',
        importSuccessDesc: 'Imported {{count}} data entries',
        importFailedTitle: 'Import failed',
        importFailedDesc: 'Failed to import data. Please check the file format.',
        clearAllTitle: 'Clear All Data',
        clearAllDesc: 'This will permanently delete all application data in your browser.',
        clearAllButton: 'Clear All Data',
        confirmDeleteTitle: 'Delete all local data?',
        confirmDeleteDesc: 'This action cannot be undone. All locally stored data including invoices, clients, and reports will be removed.',
        clearSuccessTitle: 'All data cleared',
        clearSuccessDesc: 'All application data has been cleared',
        clearFailedTitle: 'Clear failed',
        clearFailedDesc: 'Failed to clear data',
        confirmDeleteKeyTitle: 'Delete this key?',
        confirmDeleteKeyDesc: 'This action cannot be undone. The data stored under this key will be permanently removed.',
        keysListTitle: 'Stored Keys',
        noKeys: 'No keys found in local storage.'
      ,
        retentionTitle: 'Data Retention Policy',
        enableRetention: 'Enable Data Retention',
        retentionDesc: 'Automatically manage data lifecycle',
        defaultRetentionDays: 'Default Retention Period (Days)',
        autoCleanup: 'Auto Cleanup',
        categoryRetention: 'Category-specific Retention (Days)',
        encryptionTitle: 'Encryption Settings',
        enableEncryption: 'Enable Data Encryption',
        encryptionDesc: 'Encrypt sensitive data at rest',
        algorithm: 'Encryption Algorithm',
        keyRotationDays: 'Key Rotation (Days)',
        encryptPII: 'Encrypt PII and Financial Data',
        privacyTitle: 'Privacy & Compliance',
        dataAnonymization: 'Data Anonymization',
        dataAnonymizationDesc: 'Anonymize personal data for analytics',
        dataMinimization: 'Data Minimization',
        dataMinimizationDesc: 'Collect only necessary data',
        consentTracking: 'Consent Tracking',
        consentTrackingDesc: 'Track user consent for data processing',
        rightToErasure: 'Right to Erasure',
        rightToErasureDesc: 'Enable data deletion requests',
        dataPortability: 'Data Portability',
        dataPortabilityDesc: 'Allow users to export their data'
      },
      users: {
        totalAdminUsers: 'Total Admin Users',
        ceoLevel: 'CEO Level',
        managers: 'Managers',
        directors: 'Directors',
        administrativeUsers: 'Administrative Users',
        refresh: 'Refresh'
      }
    },
    // Common
    common: {
      help: 'Help',
      save: 'Save',
      cancel: 'Cancel',
      edit: 'Edit',
      delete: 'Delete',
      view: 'View',
      add: 'Add',
      update: 'Update',
      search: 'Search',
      filter: 'Filter',
      export: 'Export',
      import: 'Import',
      print: 'Print',
      loading: 'Loading...',
      noData: 'No data available',
      error: 'An error occurred',
      success: 'Operation successful',
      confirm: 'Confirm',
      yes: 'Yes',
      no: 'No',
      close: 'Close',
      back: 'Back',
      next: 'Next',
      previous: 'Previous',
      first: 'First',
      last: 'Last',
      seconds: 'seconds',
      submit: 'Submit',
      reset: 'Reset',
      signOut: 'Sign Out',
      description: 'Description',
      title: 'Title',
      details: 'Details',
      overview: 'Overview',
      upload: 'Upload',
      download: 'Download',
      general: 'General',
      newFolder: 'New Folder',
      email: 'Email',
      password: 'Password',
      newPassword: 'New Password',
      createPassword: 'Create Password',
      newHires: 'New Hires',
      newInvoices: 'New Invoices',
      reports: 'Reports',
      backToHome: 'Back to Home',
      backToDashboard: 'Back to Dashboard',
      recordExpense: 'Record Expense',
      activityLog: 'Activity Log',
      trackActivities: 'Track all activities and changes in your account',
      downloadPDF: 'Download PDF',
      searchActivities: 'Search activities...',
      allActivities: 'All Activities',
      userActions: 'User Actions',
      documents: 'Documents',
      security: 'Security',
      recentActivities: 'Recent Activities',
      noActivitiesFound: 'No activities found',
      adjustSearchFilters: 'Try adjusting your search terms or filters',
      projectBreakdown: 'Project Breakdown',
      automationLogs: 'Automation Logs',
      totalSalaryExpenses: 'Total Salary Expenses',
      noAutomationLogs: 'No automation logs found. Run manual automation to see logs.',
      history: 'History',
      reportDetails: 'Report Details',
      debug: 'Debug',
      authenticationState: 'Authentication State',
      userCredentials: 'User Credentials',
      currentUser: 'Current User',
      allAuthItems: 'All Auth-Related LocalStorage Items',
      clearAllLocalStorage: 'Clear All LocalStorage',
      refresh: 'Refresh'
    },
    // Authentication
    auth: {
      // Login page
      login: {
        title: 'Sign In to MOK Mzansi Books',
        subtitle: 'Access your business management platform',
        emailLabel: 'Email Address',
        emailPlaceholder: 'your@email.com',
        passwordLabel: 'Password',
        passwordPlaceholder: 'Enter your password',
        rememberMe: 'Remember me',
        signInButton: 'Sign In',
        signingInButton: 'Signing In...',
        dontHaveAccount: "Don't have an account?",
        signUp: 'Sign up',
        forgotPassword: 'Forgot password?',
        refreshLocalAuth: 'Refresh Local Auth',
        backToLogin: 'Back to Login',
        loginError: 'Error signing in:',
        loginSuccess: 'Signed in successfully!'
      },
      // Signup page  
      signup: {
        title: 'Create Account',
        subtitle: 'Join MOK Mzansi Books and start managing your business',
        nameLabel: 'Full Name',
        namePlaceholder: 'Enter your full name',
        emailLabel: 'Email Address',
        emailPlaceholder: 'your@email.com',
        phoneLabel: 'Phone Number',
        phonePlaceholder: 'Enter your phone number',
        companyLabel: 'Company Name',
        companyPlaceholder: 'Enter your company name',
        industryLabel: 'Industry',
        industryPlaceholder: 'Select your industry',
        passwordLabel: 'Password',
        passwordPlaceholder: 'Create a secure password',
        confirmPasswordLabel: 'Confirm Password',
        confirmPasswordPlaceholder: 'Confirm your password',
        signUpButton: 'Create Account',
        signingUpButton: 'Creating Account...',
        alreadyHaveAccount: 'Already have an account?',
        signIn: 'Sign in',
        backToLogin: 'Back to Login',
        accountCreatedSuccess: 'Account created successfully! Please check your email for verification instructions.',
        accountCreatedPartial: 'Account created, but we encountered an issue sending your verification email. Please contact support if you don\'t receive it.',
        signupError: 'Error creating account',
        welcomeTrialNotificationMessage: 'Welcome! Your 30-day free trial has started.'
      },
      // Reset Password page
      resetPassword: {
        title: 'Reset Password',
        subtitle: 'Create a new password for your account',
        validatingToken: 'Validating reset link...',
        passwordLabel: 'New Password',
        passwordPlaceholder: 'Enter your new password',
        confirmPasswordLabel: 'Confirm New Password',
        confirmPasswordPlaceholder: 'Confirm your new password',
        resetButton: 'Reset Password',
        resettingButton: 'Resetting...',
        passwordMismatch: 'Passwords do not match',
        passwordTooShort: 'Password must be at least 8 characters long',
        invalidLink: 'This password reset link is invalid or has expired.',
        requestNewLink: 'Request New Reset Link',
        passwordResetSuccess: 'Password reset successful!',
        passwordResetSuccessMessage: 'Your password has been successfully updated. You can now sign in with your new password.',
        goToLogin: 'Go to Login',
        userNotFound: 'User not found. Please sign up first.',
        resetError: 'Error resetting password',
        validationError: 'There was a problem validating your reset link.'
      },
      // Accept Invitation page
      acceptInvitation: {
        title: 'Accept Invitation',
        subtitle: 'Complete your invitation to join the team',
        verifyingInvitation: 'Verifying invitation...',
        invalidInvitation: 'This invitation is invalid or has expired',
        passwordLabel: 'Create Password',
        passwordPlaceholder: 'Create a secure password',
        confirmPasswordLabel: 'Confirm Password',
        confirmPasswordPlaceholder: 'Confirm your password',
        acceptButton: 'Accept Invitation',
        acceptingButton: 'Processing...',
        passwordMismatch: 'Password Mismatch',
        passwordMismatchMessage: 'Passwords do not match',
        passwordTooShort: 'Password Too Short',
        passwordTooShortMessage: 'Password must be at least 6 characters',
        invitationAccepted: 'Invitation accepted successfully!',
        errorAccepting: 'Error accepting invitation'
      },
      forgotPassword: {
        title: 'Forgot Password',
        resetTitle: 'Reset Your MOK Mzansi Books Password',
        description: 'Enter your email to receive a password reset link',
        successMessage: 'Check your email for reset instructions',
        emailPlaceholder: 'your@email.com',
        emailLabel: 'Email Address',
        resetButton: 'Reset Password',
        sendingButton: 'Sending...',
        backToLogin: 'Remember your password?',
        signIn: 'Sign In',
        emailSentTo: 'We\'ve sent a password reset link to',
        checkInboxMessage: 'Please check your inbox and follow the instructions to reset your password.',
        tryDifferentEmail: 'Try a different email',
        failedToSend: 'Failed to send email',
        resetError: 'Password reset error:',
        generalError: 'There was a problem processing your request. Please try again.'
      },
      authReset: {
        title: 'Auth Reset - MOK Mzansi Books',
        heading: 'Authentication Reset',
        description: 'Reset the authentication system to its default state',
        toolDescription: 'Use this tool to reset all authentication credentials to the default test accounts. This is useful if you\'re having trouble logging in.',
        adminUser: 'Admin User:',
        adminPassword: 'Admin Password:',
        resetButton: 'Reset Authentication',
        resetting: 'Resetting...',
        successMessage: 'Auth reset successful!',
        successCount: 'Success! {{count}} test users reset.',
        noCredentialsError: 'Failed to reset auth. No user credentials found.',
        failedMessage: 'Auth reset failed!',
        errorPrefix: 'Error resetting auth:',
        generalError: 'Failed to reset auth due to an error.',
        backToHome: 'Back to Home',
        goToLogin: 'Go to Login'
      },
      invitedSignup: {
        title: 'Complete Your Profile',
        invitationTitle: 'You\'ve been invited to join MOK Mzansi Books',
        verifyingMessage: 'Verifying your invitation...',
        invalidInvitation: 'Invalid Invitation',
        invalidInvitationMessage: 'The invitation link is invalid or has expired.',
        profileCompleted: 'Profile Completed',
        failedToComplete: 'Failed to complete profile',
        error: 'Error',
        nameLabel: 'Name',
        namePlaceholder: 'Your first name',
        surnameLabel: 'Surname',
        surnamePlaceholder: 'Your last name',
        emailLabel: 'Email Address',
        emailDescription: 'This email address was specified in your invitation',
        positionLabel: 'Position / Role',
        positionPlaceholder: 'Your assigned role in the organization',
        phoneLabel: 'Phone Number',
        phonePlaceholder: 'Your contact number',
        address1Label: 'Address Line 1',
        address1Placeholder: 'Street address',
        address2Label: 'Address Line 2',
        address2Placeholder: 'Apartment, suite, unit, etc.',
        address3Label: 'Address Line 3',
        address4Label: 'Address Line 4',
        cityLabel: 'City',
        postalCodeLabel: 'Postal Code',
        processingButton: 'Processing...',
        completeButton: 'Complete Profile & Continue',
        backToLogin: 'Back to Login'
      }
    },
    // Not Found
    notFound: {
      title: 'Oops! Page not found',
      message: 'Oops! Page not found'
    }
  },
  af: {
    // Navigation
    nav: {
      dashboard: 'Dashbord',
      company: 'My Maatskappy',
      clients: 'Kliënte',
      quotations: 'Kwotasies',
      invoices: 'Fakture',
      projects: 'Projekte',
      inventory: 'Voorraad',
      hr: 'Menslike Hulpbronne',
      accounting: 'Rekeningkunde',
      settings: 'Instellings'
    },
    // Dashboard
    dashboard: {
      title: 'Dashbord',
      welcome: 'Welkom terug',
      overview: 'Besigheidsoorsi',
      recentActivity: 'Onlangse Aktiwiteit',
      quickActions: 'Vinnige Aksies',
      expensesByCategory: 'Uitgawes per Kategorie',
      stats: {
        totalRevenue: 'Totale Inkomste',
        activeProjects: 'Aktiewe Projekte',
        pendingInvoices: 'Hangende Fakture',
        totalClients: 'Totale Kliënte'
      }
    },
    // Company
    company: {
      title: 'My Maatskappy',
      details: 'Maatskappy Besonderhede',
      information: 'Maatskappy Inligting',
      address: 'Adres',
      contact: 'Kontak Inligting',
      logo: 'Logo',
      save: 'Stoor',
      edit: 'Wysig',
      cancel: 'Kanselleer',
      tabs: {
        companyDetails: 'Maatskappy Besonderhede',
        teamManagement: 'Spanbestuur',
        activityLog: 'Aktiwiteitslog'
      },
      activityLog: {
        headerTitle: 'Stelsel Ouditlog',
        headerSubtitle: 'Omvattende nasporing van alle gebruikersaksies en stelselveranderings',
        buttons: {
          filters: 'Filters',
          export: 'Uitvoer',
          clearFilters: 'Vee Filters Uit'
        },
        stats: {
          totalEntries: 'Totale Inskrywings',
          critical: 'Kritiek',
          activeUsers: 'Aktiewe Gebruikers',
          today: 'Vandag'
        },
        filters: {
          title: 'Filter Opsies',
          searchLabel: 'Soek',
          searchPlaceholder: 'Soek aksies, gebruikers, beskrywings...',
          category: 'Kategorie',
          severity: 'Erns',
          page: 'Bladsy',
          changeType: 'Veranderingstipe',
          dateFrom: 'Datum Van',
          dateTo: 'Datum Tot',
          allCategories: 'Alle Kategorieë',
          allSeverities: 'Alle Ernstvlakke',
          allPages: 'Alle Bladsye',
          allTypes: 'Alle Tipes',
          create: 'Skep',
          read: 'Lees/Bekyk',
          update: 'Opdateer',
          delete: 'Verwyder',
          export: 'Uitvoer',
          import: 'Invoer',
          send: 'Stuur',
          navigation: 'Navigasie',
          crud: 'Data Veranderinge',
          auth: 'Verifikasie',
          settings: 'Instellings',
          financial: 'Finansieel',
          hr: 'HR Bestuur',
          document: 'Dokumente',
          system: 'Stelsel'
        },
        results: {
          showing: 'Wys {{shown}} van {{total}} inskrywings',
          filteredFrom: '(gefiltroeer vanaf {{all}} totaal)',
          pageOf: 'Bladsy {{current}} van {{total}}'
        },
        entry: {
          entity: 'Entiteit',
          previousValues: 'Vorige Waardes',
          newValues: 'Nuwe Waardes',
          metadata: 'Metadata',
          entryId: 'Inskrywing ID',
          userId: 'Gebruiker ID',
          immutable: 'Onveranderlik'
        },
        severity: {
          critical: 'kritiek',
          high: 'hoog',
          medium: 'medium',
          low: 'laag'
        },
        empty: {
          noMatches: 'Geen ouditinskrywings gevind wat aan jou kriteria voldoen nie'
        },
        pagination: {
          first: 'Eerste',
          last: 'Laaste'
        }
      },
      team: {
        headerTitle: 'Spanbestuur',
        headerSubtitle: 'Bestuur jou maatskappy se spanlede en regte.',
        inviteButton: 'Nooi Spanlid',
        stats: {
          totalMembers: 'Totale Lede',
          activeMembers: 'Aktiewe Lede',
          pendingInvites: 'Hangende Uitnodigings',
          syncedToHR: 'Gesinkroniseer met HR',
          pendingSync: '{count} hangende sinkronisering'
        },
        listTitle: 'Spanlede',
        adminEmployeesOnly: 'Slegs Admin Werknemers',
        viewAdminUsersTooltip: 'Bekyk Administratiewe Gebruikers in Instellings',
        goToAdminUsersTitle: 'Gaan na Administratiewe Gebruikers in Instellings om hierdie lid te bestuur',
        adminOnlyLinkedTitle: 'Slegs Admin of Primêre gebruikers is gekoppel aan Administratiewe Gebruikers',
        empty: {
          noMembers: 'Geen spanlede gevind nie',
          inviteFirst: 'Nooi jou eerste spanlid om te begin'
        },
        badges: {
          primary: 'Primêr',
          lastActivePrefix: 'Laas aktief:',
          fullAccess: 'Volle Toegang'
        },
        permissions: {
          viewPages: '{count} Bladsy(e)',
          writeCount: '{count} Skryf'
        },
        menu: {
          editAccess: 'Wysig Toegang',
          deleteUser: 'Verwyder Gebruiker'
        },
        authTarget: {
          user: 'Gebruiker',
          userPermissions: 'Gebruiker Toestemmings'
        },
        status: {
          active: 'Aktief',
          inactive: 'Onaktief',
          invited: 'Uitgenooi'
        }
      }
      ,
      forms: {
        common: {
          notApplicable: 'Nie Van Toepassing Nie',
          notSpecified: 'Nie gespesifiseer nie'
        },
        information: {
          nameLabel: 'Maatskappy Naam',
          emailLabel: 'E-pos',
          phoneLabel: 'Foon',
          websiteLabel: 'Webwerf'
        },
        address: {
          addressLabel: 'Adres',
          line1Label: 'Adres Reël 1',
          line2Label: 'Adres Reël 2',
          line3Label: 'Adres Reël 3',
          line4Label: 'Adres Reël 4',
          line1Placeholder: 'Straatnommer en naam',
          line2Placeholder: 'Woonstel, eenheid, gebou (opsioneel)',
          line3Placeholder: 'Distrik, voorstad (opsioneel)',
          line4Placeholder: 'Stad, poskode'
        },
        numbers: {
          regNumberLabel: 'Registrasienommer',
          vatNumberLabel: 'BTW Nommer',
          taxNumberLabel: 'Belastingnommer',
          csdRegistrationLabel: 'CSD Registrasie'
        },
        contact: {
          nameLabel: 'Naam',
          surnameLabel: 'Van',
          positionLabel: 'Posisie',
          selectPlaceholder: 'Kies posisie'
        },
        positions: {
          ceo: 'HB (Hoofbestuurder / CEO)',
          managingDirector: 'Besturende Direkteur (BD)',
          director: 'Direkteur',
          founder: 'Stigter',
          generalManager: 'Algemene Bestuurder (AB)',
          operationsManager: 'Bedryfsbestuurder',
          financeManager: 'Finansiële Bestuurder / HFB',
          bookkeeper: 'Boekhouer'
        }
      }
    },
    // Authentication
    auth: {
      // Login page
      login: {
        title: 'Meld aan by MOK Mzansi Books',
        subtitle: 'Toegang tot jou besigheidsbestuursplatform',
        emailLabel: 'E-posadres',
        emailPlaceholder: 'jou@epos.com',
        passwordLabel: 'Wagwoord',
        passwordPlaceholder: 'Voer jou wagwoord in',
        rememberMe: 'Onthou my',
        signInButton: 'Meld aan',
        signingInButton: 'Meld tans aan...',
        dontHaveAccount: 'Het jy nie \'n rekening nie?',
        signUp: 'Sluit aan',
        forgotPassword: 'Wagwoord vergeet?',
        refreshLocalAuth: 'Verfris Plaaslike Stawing',
        backToLogin: 'Terug na Aanmelding',
        loginError: 'Fout met aanmelding:',
        loginSuccess: 'Suksesvol aangemeld!'
      },
      // Signup page
      signup: {
        title: 'Skep Rekening',
        subtitle: 'Sluit aan by MOK Mzansi Books en begin jou besigheid bestuur',
        nameLabel: 'Volle Naam',
        namePlaceholder: 'Voer jou volle naam in',
        emailLabel: 'E-posadres',
        emailPlaceholder: 'jou@epos.com',
        phoneLabel: 'Telefoonnommer',
        phonePlaceholder: 'Voer jou telefoonnommer in',
        companyLabel: 'Maatskappynaam',
        companyPlaceholder: 'Voer jou maatskappynaam in',
        industryLabel: 'Bedryf',
        industryPlaceholder: 'Kies jou bedryf',
        passwordLabel: 'Wagwoord',
        passwordPlaceholder: 'Skep \'n veilige wagwoord',
        confirmPasswordLabel: 'Bevestig Wagwoord',
        confirmPasswordPlaceholder: 'Bevestig jou wagwoord',
        signUpButton: 'Skep Rekening',
        signingUpButton: 'Besig om rekening te skep...',
        alreadyHaveAccount: 'Het jy reeds \'n rekening?',
        signIn: 'Meld aan',
        backToLogin: 'Terug na Aanmelding',
        accountCreatedSuccess: 'Rekening suksesvol geskep! Gaan asseblief jou e-pos na vir verifikasie-instruksies.',
        accountCreatedPartial: 'Rekening geskep, maar ons het \'n probleem ondervind met die stuur van jou verifikasie-e-pos. Kontak asseblief ondersteuning as jy dit nie ontvang nie.',
        signupError: 'Fout met die skep van rekening',
        welcomeTrialNotificationMessage: 'Welkom! Jou 30-dae gratis proeflopie het begin.'
      },
      // Reset Password page
      resetPassword: {
        title: 'Herstel Wagwoord',
        subtitle: 'Skep \'n nuwe wagwoord vir jou rekening',
        validatingToken: 'Besig om herstelskakel te valideer...',
        passwordLabel: 'Nuwe Wagwoord',
        passwordPlaceholder: 'Voer jou nuwe wagwoord in',
        confirmPasswordLabel: 'Bevestig Nuwe Wagwoord',
        confirmPasswordPlaceholder: 'Bevestig jou nuwe wagwoord',
        resetButton: 'Herstel Wagwoord',
        resettingButton: 'Besig om te herstel...',
        passwordMismatch: 'Wagwoorde stem nie ooreen nie',
        passwordTooShort: 'Wagwoord moet ten minste 8 karakters lank wees',
        invalidLink: 'Hierdie wagwoordherstel-skakel is ongeldig of het verval.',
        requestNewLink: 'Versoek Nuwe Herstelskakel',
        passwordResetSuccess: 'Wagwoordherstel suksesvol!',
        passwordResetSuccessMessage: 'Jou wagwoord is suksesvol opgedateer. Jy kan nou met jou nuwe wagwoord aanmeld.',
        goToLogin: 'Gaan na Aanmelding',
        userNotFound: 'Gebruiker nie gevind nie. Sluit asseblief eers aan.',
        resetError: 'Fout met wagwoordherstel',
        validationError: 'Daar was \'n probleem met die validering van jou herstelskakel.'
      },
      // Accept Invitation page
      acceptInvitation: {
        title: 'Aanvaar Uitnodiging',
        subtitle: 'Voltooi jou uitnodiging om by die span aan te sluit',
        verifyingInvitation: 'Besig om uitnodiging te verifieer...',
        invalidInvitation: 'Hierdie uitnodiging is ongeldig of het verval',
        passwordLabel: 'Skep Wagwoord',
        passwordPlaceholder: 'Skep \'n veilige wagwoord',
        confirmPasswordLabel: 'Bevestig Wagwoord',
        confirmPasswordPlaceholder: 'Bevestig jou wagwoord',
        acceptButton: 'Aanvaar Uitnodiging',
        acceptingButton: 'Besig om te verwerk...',
        passwordMismatch: 'Wagwoorde Stem Nie Ooreen Nie',
        passwordMismatchMessage: 'Wagwoorde stem nie ooreen nie',
        passwordTooShort: 'Wagwoord Te Kort',
        passwordTooShortMessage: 'Wagwoord moet ten minste 6 karakters lank wees',
        invitationAccepted: 'Uitnodiging suksesvol aanvaar!',
        errorAccepting: 'Fout met die aanvaarding van uitnodiging'
      },
      forgotPassword: {
        title: 'Wagwoord Vergeet',
        resetTitle: 'Herstel Jou MOK Mzansi Books Wagwoord',
        description: 'Voer jou e-pos in om \'n wagwoordherstel-skakel te ontvang',
        successMessage: 'Gaan jou e-pos na vir herstel-instruksies',
        emailPlaceholder: 'jou@epos.com',
        emailLabel: 'E-posadres',
        resetButton: 'Herstel Wagwoord',
        sendingButton: 'Besig om te stuur...',
        backToLogin: 'Onthou jy jou wagwoord?',
        signIn: 'Meld Aan',
        emailSentTo: 'Ons het \'n wagwoordherstel-skakel gestuur na',
        checkInboxMessage: 'Gaan asseblief jou inkassie na en volg die instruksies om jou wagwoord te herstel.',
        tryDifferentEmail: 'Probeer \'n ander e-pos',
        failedToSend: 'Kon nie e-pos stuur nie',
        resetError: 'Wagwoordherstel-fout:',
        generalError: 'Daar was \'n probleem met die verwerking van jou versoek. Probeer asseblief weer.'
      },
      authReset: {
        title: 'Stawing Herstel - MOK Mzansi Books',
        heading: 'Stawing Herstel',
        description: 'Herstel die stawingstelsel na sy verstektoestand',
        toolDescription: 'Gebruik hierdie instrument om alle stawingbewyse na die verstek toetsrekeninge te herstel. Dit is nuttig as jy probleme ondervind met aanmelding.',
        adminUser: 'Admin Gebruiker:',
        adminPassword: 'Admin Wagwoord:',
        resetButton: 'Herstel Stawing',
        resetting: 'Besig om te herstel...',
        successMessage: 'Stawing suksesvol herstel!',
        successCount: 'Sukses! {{count}} toetsgebruikers herstel.',
        noCredentialsError: 'Kon nie stawing herstel nie. Geen gebruikerbewyse gevind nie.',
        failedMessage: 'Stawing herstel onsuksesvol!',
        errorPrefix: 'Fout met herstel van stawing:',
        generalError: 'Kon nie stawing herstel nie as gevolg van \'n fout.',
        backToHome: 'Terug na Tuisblad',
        goToLogin: 'Gaan na Aanmelding'
      },
      invitedSignup: {
        title: 'Voltooi Jou Profiel',
        invitationTitle: 'Jy is uitgenooi om by MOK Mzansi Books aan te sluit',
        verifyingMessage: 'Besig om jou uitnodiging te verifieer...',
        invalidInvitation: 'Ongeldige Uitnodiging',
        invalidInvitationMessage: 'Die uitnodigingskakel is ongeldig of het verval.',
        profileCompleted: 'Profiel Voltooi',
        failedToComplete: 'Kon nie profiel voltooi nie',
        error: 'Fout',
        nameLabel: 'Naam',
        namePlaceholder: 'Jou voornaam',
        surnameLabel: 'Van',
        surnamePlaceholder: 'Jou van',
        emailLabel: 'E-posadres',
        emailDescription: 'Hierdie e-posadres is in jou uitnodiging gespesifiseer',
        positionLabel: 'Posisie / Rol',
        positionPlaceholder: 'Jou toegewysde rol in die organisasie',
        phoneLabel: 'Telefoonnommer',
        phonePlaceholder: 'Jou kontaknommer',
        address1Label: 'Adres Reël 1',
        address1Placeholder: 'Straatadres',
        address2Label: 'Adres Reël 2',
        address2Placeholder: 'Woonstel, suite, eenheid, ens.',
        address3Label: 'Adres Reël 3',
        address4Label: 'Adres Reël 4',
        cityLabel: 'Stad',
        postalCodeLabel: 'Poskode',
        processingButton: 'Besig om te verwerk...',
        completeButton: 'Voltooi Profiel & Gaan Voort',
        backToLogin: 'Terug na Aanmelding'
      }
    },
    // Quotations
    quotations: {
      title: 'Kwotasies',
      description: 'Skep, bestuur en volg jou kwotasies',
      createQuotation: 'Skep Kwotasie',
      quotationNumber: 'Kwotasie Nommer',
      client: 'Kliënt',
      date: 'Datum',
      amount: 'Bedrag',
      status: 'Status',
      actions: 'Aksies',
      table: {
        quotation: 'Kwotasie',
        client: 'Kliënt',
        date: 'Datum',
        amount: 'Bedrag',
        status: 'Status',
        salesperson: 'Verkoopsverteenwoordiger',
        openMenu: 'Maak kieslys oop'
      },
      statusLabels: {
        draft: 'Konsep',
        sent: 'Gestuur',
        viewed: 'Beskou',
        accepted: 'Aanvaar',
        rejected: 'Verwerp',
        expired: 'Verval'
      },
      stats: {
        totalQuotations: 'Totale Kwotasies',
        totalValue: 'Totale Waarde',
        conversionRate: 'Omskakelingskoers',
        averageValue: 'Gemiddelde Waarde',
        accepted: 'Aanvaar',
        sent: 'Gestuur',
        viewed: 'Beskou',
        draft: 'Konsep',
        expired: 'Verval',
        rejected: 'Verwerp',
        desc: {
          allCreated: 'Alle kwotasies geskep',
          combinedValue: 'Gekombineerde kwotasiewaarde',
          toSalesRatio: 'Kwotasie tot verkope-verhouding',
          avgAmount: 'Gemiddelde kwotasiebedrag',
          totalAmount: '{{amount}} totaal',
          sentToClients: 'Gestuur na kliënte',
          seenByClients: 'Deur kliënte beskou',
          notYetSent: 'Nog nie gestuur nie',
          pastExpiry: 'Verby vervaldatum',
          declinedByClients: 'Deur kliënte afgekeur'
        }
    }
  },
  filters: {
    title: 'Gevorderde Filters',
    dateRange: 'Datumreeks',
    dateType: {
      created: 'Geskep Datum',
      expiry: 'Vervaldatum',
      modified: 'Laas Gewysig'
    },
    startDate: 'Begindatum',
    endDate: 'Einddatum',
    amountRange: 'Bedragreeks',
    minAmount: 'Min Bedrag',
    maxAmount: 'Maks Bedrag',
    salesperson: 'Verkoopsverteenwoordiger',
    allSalespersons: 'Alle Verkoopsverteenwoordigers',
    tags: 'Merkers',
    customFields: 'Pasgemaakte Velde',
    department: 'Departement',
    allDepartments: 'Alle Departemente',
    region: 'Streek',
    allRegions: 'Alle Streke',
    regions: {
      westernCape: 'Wes-Kaap',
      gauteng: 'Gauteng',
      kwazuluNatal: 'KwaZulu-Natal'
    },
    infoActiveApplied: 'Aktiewe filters sal op die kwotasielys toegepas word',
    reset: 'Stel Filters Terug',
    apply: 'Pas Filters Toe'
  },
  pagination: {
    show: 'Wys:',
    perPage: 'per bladsy',
    showingRange: 'Wys {{start}}-{{end}} van {{total}} kwotasies',
    pageXofY: 'Bladsy {{current}} van {{total}}',
    firstPage: 'Eerste bladsy',
    previousPage: 'Vorige bladsy',
    nextPage: 'Volgende bladsy',
    lastPage: 'Laaste bladsy',
    goToPage: 'Gaan na bladsy {{page}}'
  },
  // Header
  header: {
    refresh: 'Herlaai'
  },
  sendQuotation: 'Stuur Kwotasie',
  editQuotation: 'Wysig Kwotasie',
  downloadQuotation: 'Laai Kwotasie Af',
  convertToInvoice: 'Skakel om na Faktuur',
  generatingPDF: 'Genereer PDF...',
  converting: 'Skakel om... ',
  markAsAccepted: 'Merk as Aanvaar',
  markAsRejected: 'Merk as Verwerp',
  downloadPDF: 'Laai PDF Af',
  duplicate: 'Dupliseer',
  statusLabels: {
    draft: 'Konsep',
    saved: 'Gestoor',
    sent: 'Gestuur',
    viewed: 'Besigtig',
    accepted: 'Aanvaar',
    rejected: 'Verwerp',
    expired: 'Verval',
    cancelled: 'Gekanselleer'
  },
  dialogs: {
    deleteTitle: 'Skrap Kwotasie',
    deleteDescription: 'Is jy seker jy wil hierdie kwotasie skrap? Hierdie aksie kan nie ongedaan gemaak word nie.',
    cancel: 'Kanselleer',
    confirmDelete: 'Skrap',
    sendTitle: 'Stuur Kwotasie',
    sendDescription: 'Stuur kwotasie {{number}} na {{email}}?',
    sendConfirm: 'Stuur'
  },
  toasts: {
    deleted: 'Kwotasie suksesvol geskrap',
    sent: 'Kwotasie gestuur na {{email}}',
    convertedToInvoice: 'Kwotasie suksesvol na faktuur omgeskakel',
    convertFailed: 'Kon nie kwotasie na faktuur omskakel nie',
    pdfFailed: 'Kon nie PDF genereer nie. Probeer asseblief weer.',
    statusUpdated: 'Status bygewerk',
    statusUpdateFailed: 'Kon nie status bywerk nie'
  }
},
// Zulu
zu: {
// Quotations
quotations: {
  title: 'Amaquotation',
  description: 'Dala, phatha, futhi landela ama-quotation akho',
  createQuotation: 'Dala I-quotation',
  quotationNumber: 'Inombolo Ye-quotation',
  client: 'Ikhasimende',
  date: 'Usuku',
  amount: 'Inani',
  status: 'Isimo',
  actions: 'Izenzo',
  table: {
    quotation: 'I-quotation',
    client: 'Ikhasimende',
    date: 'Usuku',
    amount: 'Inani',
    status: 'Isimo',
    salesperson: 'Umthengisi',
    openMenu: 'Vula imenyu'
  },
  statusLabels: {
    draft: 'Okusalungiswa',
    sent: 'Kuthunyelwe',
    viewed: 'Kubukwe',
    accepted: 'Kwamukelwe',
    rejected: 'Kwenqatshwe',
    expired: 'Kuphelelwe Isikhathi'
  },
  search: {
    placeholder: 'Sesha ama-quotation ngenombolo, ikhasimende, noma inkomba',
    advancedFilters: 'Izihlungi Ezithuthukile',
    saveFilter: 'Gcina Isihlungi',
    clearFilters: 'Sula Izihlungi',
    recent: 'Kamuva:',
    statusSearchPlaceholder: 'Sesha isimo...',
    noStatusFound: 'Asitholakalanga isimo.',
    quick: {
      allStatus: 'Zonke Izimo',
      allDates: 'Zonke Izinsuku',
      today: 'Namuhla',
      thisWeek: 'Kuleli Viki',
      thisMonth: 'Le Nyanga',
      thisQuarter: 'Lekota',
      thisYear: 'Kulo Nyaka',
      allClients: 'Wonke Amakhasimende'
    }
  },
  filters: {
    title: 'Izihlungi Ezithuthukile',
    dateRange: 'Ibanga Losuku',
    dateType: {
      created: 'Usuku Oludalwe',
      expiry: 'Usuku Lokuphelelwa',
      modified: 'Kulungiswe Kokugcina'
    },
    startDate: 'Usuku Ukuqala',
    endDate: 'Usuku Ukuphela',
    amountRange: 'Ibanga Lenani',
    minAmount: 'Inani Elincane',
    maxAmount: 'Inani Elikhulu',
    salesperson: 'Umthengisi',
    allSalespersons: 'Bonke Abathengisi',
    tags: 'Amathegi',
    customFields: 'Izinkambu Zokwezifiso',
    department: 'Umnyango',
    allDepartments: 'Yonke Iminyango',
    region: 'Isifunda',
    allRegions: 'Zonke Izifunda',
    regions: {
      westernCape: 'Western Cape',
      gauteng: 'Gauteng',
      kwazuluNatal: 'KwaZulu-Natal'
    },
    infoActiveApplied: 'Izihlungi ezisebenzayo zizosebenza ohlwini lwama-quotation',
    reset: 'Setha Izihlungi Kabusha',
    apply: 'Sebenzisa Izihlungi'
  },
      dialogs: {
        deleteTitle: 'Susa I-quotation',
        deleteDescription: 'Uqinisekile ukuthi ufuna ukususa le quotation? Lesi senzo asikwazi ukubuyiselwa emuva.',
        cancel: 'Khansela',
        confirmDelete: 'Susa',
        sendTitle: 'Thumela I-quotation',
        sendDescription: 'Thumela i-quotation {{number}} ku {{email}}?',
        sendConfirm: 'Thumela'
      },
      toasts: {
        deleted: 'I-quotation isusiwe ngempumelelo',
        sent: 'I-quotation ithunyelwe ku {{email}}',
        convertedToInvoice: 'I-quotation iguqulwe yaba yi-invoice ngempumelelo',
        convertFailed: 'Yehlulekile ukuguqula i-quotation ibe yi-invoice',
        pdfFailed: 'Yehlulekile ukukhiqiza i-PDF. Sicela uzame futhi.',
        statusUpdated: 'Isimo sibuyekeziwe',
        statusUpdateFailed: 'Yehlulekile ukubuyekeza isimo'
      }
    },
    // Invoices
    invoices: {
      title: 'Fakture',
      description: 'Skep, bestuur en volg jou fakture en betalings',
      createInvoice: 'Skep Faktuur',
      invoiceNumber: 'Faktuurnommer',
      client: 'Kliënt',
      date: 'Datum',
      dueDate: 'Vervaldatum',
      amount: 'Bedrag',
      status: 'Status',
      actions: 'Aksies',
      receivePayment: 'Ontvang Betaling',
      recordPaymentTooltip: 'Teken betaling vir die geselekteerde faktuur aan',
      selectInvoiceToRecordPayment: 'Kies ’n faktuur om ’n betaling aan te teken'
      ,
      // UI labels
      searchPlaceholder: 'Soek fakture...',
      tableView: 'Tabel',
      gridView: 'Rooster',
      newInvoiceButton: 'Nuwe Faktuur',
      allClients: 'Alle Kliënte',
      // Summary cards
      summary: {
        totalInvoiced: 'Totaal Gefaktureer',
        outstandingBalance: 'Uitstaande Balans',
        overdueAmount: 'Agterstallige Bedrag',
        paidThisPeriod: 'Betaal in Hierdie Tydperk',
        vsLastPeriod: 'vs vorige tydperk'
      },
      // Filters
      filters: {
        label: 'Filters',
        status: 'Status',
        dateRange: 'Datumreeks',
        allStatuses: 'Alle Statusse',
        clearAll: 'Vee alle filters uit',
        clear: 'Vee uit',
        saveFilter: 'Stoor Filter',
        more: 'Meer Filters',
        advanced: 'Gevorderde Filters',
        amountRange: 'Bedragreeks',
        min: 'Min',
        max: 'Maks',
        allDates: 'Alle Datums',
        today: 'Vandag',
        thisWeek: 'Hierdie Week',
        customRange: 'Pasgemaakte Reeks',
        dateAllTime: 'Hele Tydperk',
        dateThisMonth: 'Hierdie Maand',
        dateLastMonth: 'Verlede Maand',
        dateThisQuarter: 'Hierdie Kwartaal',
        dateLastQuarter: 'Verlede Kwartaal',
        dateThisYear: 'Hierdie Jaar'
      },
      // Status display labels
      statusLabels: {
        draft: 'Konsep',
        sent: 'Gestuur',
        viewed: 'Bekyk',
        partial: 'Gedeeltelik',
        unpaid: 'Onbetaal',
        paid: 'Betaal',
        overdue: 'Agterstallig',
        cancelled: 'Gekanselleer'
      },
      // Table and actions
      vatAmount: 'BTW-bedrag',
      table: {
        openMenu: 'Maak kieslys oop'
      },
      actionLabels: {
        view: 'Bekyk',
        edit: 'Wysig',
        send: 'Stuur',
        duplicate: 'Dupliseer',
        recordPayment: 'Teken Betaling Aan',
        delete: 'Verwyder'
      },
      empty: {
        noInvoices: 'Geen fakture gevind nie.',
        createFirst: 'Skep jou eerste faktuur om te begin.'
      },
      dialogs: {
        deleteTitle: 'Verwyder Faktuur',
        deleteDescription: 'Is jy seker jy wil hierdie faktuur verwyder? Hierdie aksie kan nie ongedaan gemaak word nie.',
        cancel: 'Kanselleer',
        confirmDelete: 'Verwyder'
      },
      toasts: {
        deleted: 'Faktuur suksesvol verwyder',
        statusUpdated: 'Faktuurstatus is bygewerk',
        selectOneToRecord: 'Kies asseblief ’n faktuur om ’n betaling aan te teken',
        selectOnlyOneToRecord: 'Kies asseblief slegs een faktuur om ’n betaling aan te teken',
        paymentRecorded: 'Betaling suksesvol aangeteken'
      }
    },
    // Projects
    projects: {
      title: 'Amaphrojekthi',
      description: 'Phatha futhi ulandele wonke amaphrojekthi akho',
      createProject: 'Dala Iphrojekthi',
      newProjectButton: 'Iphrojekthi Entsha',
      projectName: 'Igama Lephrojekthi',
      client: 'Ikhasimende',
      manager: 'Umphathi',
      startDate: 'Usuku Lokuqala',
      endDate: 'Usuku Lokuphela',
      schedule: 'Isheduli',
      ongoing: 'Kuyaqhubeka',
      status: 'Isimo',
      progress: 'Inqubekela phambili',
      actions: 'Izenzo',
      searchPlaceholder: 'Sesha amaphrojekthi ngegama, ikhasimende, noma inkomba',
      filters: {
        label: 'Izihlungi',
        allStatuses: 'Zonke Izimo'
      },
      sort: {
        name: 'Igama Lephrojekthi',
        client: 'Ikhasimende',
        progress: 'Inqubekela phambili',
        budget: 'Isabelomali',
        startDate: 'Usuku Lokuqala',
        endDate: 'Usuku Lokuphela'
      },
      statusLabels: {
        inProgress: 'Luqhubeka',
        completed: 'Luqedile',
        planning: 'Ukuhlela',
        onHold: 'Kubekiwe',
        cancelled: 'Kukhanseliwe',
        ongoing: 'Kuyaqhubeka'
      },
      stats: {
        totalProjects: 'Amaphrojekthi Wonke',
        active: 'Asebenzayo',
        completed: 'Aqediwe',
        overdue: 'Kudlulile Ngesikhathi',
        budget: 'Isabelomali',
        expenses: 'Izindleko',
        profit: 'Inzuzo'
      },
      grid: {
        client: 'Ikhasimende:',
        manager: 'Umphathi:',
        start: 'Qala:',
        end: 'Phela:',
        projectProgress: 'Inqubekela phambili yephrojekthi',
        tasksLabel: 'Imisebenzi',
        noTasks: 'Azikho izabelo',
        updatedAutomatically: 'Kubuyekezwa ngokuzenzakalelayo',
        budget: 'Isabelomali',
        expenses: 'Izindleko',
        empty: 'Akukho amaphrojekthi atholakele'
      },
      actionsBar: {
        selectedCount: '{{count}} okukhethiwe',
        edit: 'Hlela',
        delete: 'Susa'
      },
      actionLabels: {
        view: 'Buka',
        edit: 'Hlela',
        viewDetails: 'Buka Imininingwane',
        editProject: 'Hlela Iphrojekthi',
        cancelProject: 'Khansela Iphrojekthi'
      },
      dialog: {
        cancelTitle: 'Khansela u-{{name}}?',
        cancelDescription: 'Lesi senzo sizomaka iphrojekthi njengekhanseliwe futhi ngeke kube lula ukukususa. Yonke imininingwane ehlobene izogcinwa kodwa iphrojekthi ngeke isavela kumaphrojekthi asebenzayo.',
        cancel: 'Khansela',
        confirmCancel: 'Khansela Iphrojekthi'
      }
    },
    // Inventory
    inventory: {
      title: 'Voorraad',
      addItem: 'Voeg Item By',
      itemName: 'Item Naam',
      category: 'Kategorie',
      quantity: 'Hoeveelheid',
      price: 'Prys',
      status: 'Status',
      actions: 'Aksies',
      trackManageOptimize: 'Volg, bestuur en optimaliseer jou voorraad',
      newStock: 'Nuwe Voorraad',
      updateStock: 'Opdateer Voorraad',
      scanBarcode: 'Skandeer Strepieskode',
      addSupplier: 'Voeg Verskaffer By',
      addStorage: 'Voeg Stoor By',
      sales: 'Verkope',
      searchByName: 'Soek volgens naam, ID, strepieskode, verskaffer, beskrywing...',
      allCategories: 'Alle Kategorieë',
      allStatuses: 'Alle Statusse',
      generateReports: 'Genereer Verslae',
      reports: 'Verslae',
      inventoryItems: 'Voorraad Items',
      allStock: 'Alle Voorraad',
      lowStock: 'Lae Voorraad',
      expiringSoon: 'Verval Binnekort',
      damaged: 'Beskadig',
      history: 'Geskiedenis',
      refresh: 'Herlaai',
      loadingInventoryData: 'Laai voorraad data...',
      stockHistory: 'Voorraad Geskiedenis',
      noStockHistoryAvailable: 'Geen voorraad geskiedenis beskikbaar nie',
      date: 'Datum',
      itemId: 'Item ID',
      type: 'Tipe',
      notes: 'Notas',
      performedBy: 'Uitgevoer Deur',
      deleteConfirmation: 'Is jy seker jy wil hierdie item uitvee?',
      youAreAboutToDelete: 'Jy gaan die volgende uitvee:',
      thisActionCannotBeUndone: 'Hierdie aksie kan nie ongedaan gemaak word nie.',
      cancel: 'Kanselleer',
      delete: 'Uitvee',
      itemHistory: 'Item Geskiedenis',
      viewingHistoryFor: 'Bekyk geskiedenis vir {{name}} (ID: {{id}})',
      noHistoryRecords: 'Geen geskiedenis rekords gevind vir hierdie item nie',
      close: 'Sluit',
      editItemDetails: 'Wysig Item Besonderhede',
      updateDetailsFor: 'Opdateer die besonderhede vir {{name}}',
      addedToInvoice: 'Bygevoeg by faktuur',
      addedToQuotation: 'Bygevoeg by kwotasie',
      hasBeenAddedTo: '{{itemName}} is bygevoeg by jou {{type}}',
      itemDeleted: 'Item Uitgevee',
      hasBeenRemovedFromInventory: '{{itemName}} is verwyder uit voorraad',
      error: 'Fout',
      failedToDeleteItem: 'Kon nie item uitvee nie',
      errorOccurredWhileDeleting: 'Fout het voorgekom tydens uitvee van item',
      refreshed: 'Herlaai',
      inventoryDataRefreshed: 'Voorraad data is herlaai vanaf stoor',
      stockUpdated: 'Voorraad Opgedateer',
      stockUpdatedSuccessfully: '{{itemName}} voorraad is suksesvol opgedateer.'
    },
    // HR Management
    hr: {
      title: 'Ukuphathwa Kwabasebenzi',
      subtitle: 'Phatha abasebenzi, i-payroll, kanye nezinsiza zabantu',
      // Tabs
      hrmDashboard: 'Ihhovisi le-HRM',
      employees: 'Abasebenzi',
      employeeDirectory: 'Uhlu Lwabasebenzi',
      leaveManagement: 'Ukuphathwa Kweholide',
      timeAndAttendance: 'Isikhathi Nokuba Khona',
      training: 'Ukuqeqeshwa',
      performance: 'Ukusebenza',
      disciplinary: 'Uhlelo Lokujezisa',
      allowance: 'Isibonelelo',
      payroll: 'I-Payroll',
      // Metrics
      totalEmployees: 'Inani Labasebenzi',
      newHires: 'Abasanda Qashwa',
      thisMonth: 'Le nyanga',
      onLeaveToday: 'Abaseholidini Namuhla',
      birthdays: 'Izinsuku Zokuzalwa',
      thisWeek: 'Leli viki',
      openPositions: 'Izikhundla Ezivuliwe',
      turnoverRate: 'Izinga Lokushintsha',
      belowTarget: 'Ngaphansi kwenhloso',
      // Quick Actions
      quickActions: 'Izenzo Ezisheshayo',
      addEmployee: 'Engeza Umsebenzi',
      approveLeave: 'Vuma Iholidi',
      employeeName: 'Igama Lomsebenzi',
      position: 'Isikhundla',
      department: 'Umnyango',
      salary: 'Umholo',
      status: 'Isimo',
      actions: 'Izenzo'
    },
    // Accounting
    accounting: {
      title: 'Ukubala',
      overview: 'Ukubuka Konke Kwezezimali',
      income: 'Imali Engenayo',
      expenses: 'Izindleko',
      profit: 'Inzuzo',
      reports: 'Imibiko',
      transactions: 'Ukuthengiselana',
      // Page
      subtitle: 'Phatha ezimali zebhizinisi lakho, izindleko, nemibhalo yezimali',
      tax: 'Intela',
      // Cards
      totalRevenue: 'Imali engenayo iyonke',
      totalExpenses: 'Izindleko eziphelele',
      netProfit: 'Inzuzo Ehlanzekile',
      outstanding: 'Okusele',
      pendingPayments: 'izinkokhelo ezisalindile',
      // Overview sections
      recentTransactions: 'Ukuthengiselana Kwakamuva',
      financialSummary: 'Isifinyezo Sezezimali',
      monthlyRevenue: 'Imali engenayo yanyanga zonke',
      monthlyExpenses: 'Izindleko zanyanga zonke',
      taxLiability: 'Isibopho Sentela',
      netIncome: 'Imali engenayo ehlanzekile',
      vsLastMonth: 'kuqhathaniswa nenyanga edlule',
      noRecentTransactions: 'Akukho ukuthengiselana kwakamuva okutholiwe',
      addSomeExpensesOrIncome: 'Engeza izindleko noma imali engenayo ukuze kubonakale lapha'
    },
    // Settings
    settings: {
      title: 'Izilungiselelo',
      general: 'Okuvamile',
      localization: 'Ukwenza Kube Kwasendaweni',
      description: 'Lungisa izilungiselelo zohlelo lokusebenza',
      defaultLanguage: 'Ulimi Oluvamile',
      dateFormat: 'Ifomethi Yosuku',
      timeFormat: 'Ifomethi Yesikhathi',
      timezone: 'Indawo Yesikhathi',
      currency: 'Imali',
      firstDayOfWeek: 'Usuku Lokuqala Lweveki',
      numberFormat: 'Ifomethi Yenombolo',
      measurementUnits: 'Amayunithi Okulinganisa',
      companyInformation: 'Ulwazi Lwenkampani',
      companyName: 'Igama Lenkampani',
      businessType: 'Uhlobo Lwebhizinisi',
      industry: 'Imboni',
      registrationNumber: 'Inombolo Yokubhalisa',
      vatNumber: 'Inombolo Ye-VAT',
      physicalAddress: 'Idilesi Ebonakalayo',
      mailingAddress: 'Idilesi Yeposi',
      companyLogo: 'Ilogo Yenkampani',
      // Display settings
      displaySettings: 'Izilungiselelo Zokubonisa',
      theme: 'Indikimba',
      fontSize: 'Usayizi Wombhalo',
      themeLight: 'Mhlophe',
      themeDark: 'Mnyama',
      themeAuto: 'Okuzenzakalelayo',
      fontSmall: 'Ncane',
      fontMedium: 'Maphakathi',
      fontLarge: 'Nkulu',
      tabs: {
        general: 'Okuvamile',
        users: 'Abasebenzisi',
        security: 'Ezokuphepha',
        notifications: 'Izaziso',
        data: 'Idatha',
        mobile: 'Iselula',
        billing: 'Ukukhokha',
        help: 'Usizo',
        about: 'Mayelana',
        reports: 'Imibiko',
        dataSecurity: 'Ukuvikelwa Kwemininingwane',
        maintenance: 'Ukugcinwa'
      },
      help: {
        title: 'Usizo & Ukusekela',
        intro: 'Thola usizo, hlola izinsiza, noma ulungise izinkinga ezivamile.',
        buttons: {
          emailSupport: 'I-imeyili Yokusekela',
          contactPage: 'Ikhasi Lokuxhumana',
          website: 'Iwebhusayithi',
          copyDiagnostics: 'Kopisha i-diagnostics',
          enableAutoClean: 'Vula i-Auto-clean yezaziso ezibambekile',
          disableAutoClean: 'Cisha i-Auto-clean yezaziso ezibambekile',
          forceCleanupNow: 'Phoqa ukuhlanza manje',
          checkNetwork: 'Hlola inethiwekhi',
          clearAppCache: 'Sula i-cache yohlelo',
          resetAuthReload: 'Setha kabusha i-auth & layisha kabusha'
        },
        stats: {
          status: 'Isimo',
          online: 'Ku-inthanethi',
          offline: 'Ayikho inthanethi',
          storageKeys: 'Okhiye Bokugcina',
          localDataSize: 'Usayizi Wedatha Yendawo'
        },
        troubleshooting: 'Ukuxazulula Izinselelo',
        contextual: {
          heading: '{{title}} — Amathiphu & Isiqondiso',
          generic: 'Usizo olujwayelekile kanye ne-diagnostics. Pheqa uye kumojula ukuze uthole amathiphu athize.',
          company: {
            p1: 'Phatha iphrofayela yenkampani futhi uhambise imininingwane kuma-HR.',
            li1: 'Buyekeza imininingwane yenkampani ku-Company Details bese ugcina.',
            li2: 'Sebenzisa i-Team Management ukuphatha ama-admin. Ukuvumelanisa kuzobonakala ku-HR → Employees.',
            li3: 'Bheka i-console ukuze ubone imiyalezo yokuvumelanisa noma izexwayiso zamaphinda kabili.',
            li4: 'Uma ubona amaphutha okuphindaphinda, vula i-HR bese usebenzisa amathuluzi okuhlanza.'
          },
          clients: {
            p1: 'Landelela amakhasimende nemisebenzi yawo kuma-invoyisi nasezinkokhelweni.',
            li1: 'Sebenzisa inkinobho ethi Engeza Ikhasimende ukudala amarekhodi; ukuhlela nokususa kubhalwa ku-console.',
            li2: 'Hlunga futhi uhlele usebenzisa izilawuli zekhanda; izenzo zobuningi ziyatholakala lapho kusebenza.',
            li3: 'Isimo sibalwa emisebenzini yakamuva nasezibalansini ze-invoyisi; bheka i-console diagnostics.'
          },
          quotations: {
            p1: 'Dala, bheka ngaphambi kokuthumela, bese uthumela ama-quotation ane-VAT nezaphulelo.',
            li1: 'Faka izinto zomugqa ezinobuningi, izinga, intela, nezaphulelo.',
            li2: 'Sebenzisa i-Preview ukubuyekeza imininingwane yekhasimende namatotali ngaphambi kokuthumela.',
            li3: 'I-console ibonisa izinto ezicutshunguliwe nokumiswa kwekhasimende okukhethiwe ukuze kulungiswe amaphutha.',
            li4: 'I-VAT ibalwa ngomugqa ngamunye futhi ifingqwe; qinisekisa amatotali ngokumelene nokukhipha kwe-console.'
          },
          invoices: {
            p1: 'Dala ama-invoyisi nama-PDF alandekayo anophawu lwekhasimende nenkampani.',
            li1: 'Khetha ikhasimende, engeza izinto, qinisekisa i-subtotal, i-VAT, kanye nenani eliphelele.',
            li2: 'Landa noma ubuke ama-PDF; i-console ibamba ukudalwa nemicimbi ye-PDF.',
            li3: 'Izikhundla zelogo, isignesha, nesitembu ziyalungiseka kuzilungiselelo noma ezindaweni zophawu.'
          },
          projects: {
            p1: 'Phatha amaphrojekthi futhi ulandele izindleko eziphelele ngokuvumelanisa ukubakhona.',
            li1: 'Dala/buyekeza amaphrojekthi; izibuyekezo ziboniswa kumatotali ngemiyalezo yokuvumelanisa ku-console.',
            li2: 'Ukuvumelanisa ngezikhathi kuzobika imicimbi efana nokuthi "Projects: Received sync update".'
          },
          inventory: {
            p1: 'Gcina uhlu lwemikhiqizo/izinsiza ukuze lusetshenziswe kuma-quotation nasezinkontilekeni.',
            li1: 'Engeza noma hlela izinto nge-SKU, intengo, nezilungiselelo zentela.',
            li2: 'I-console igxile ekutholeni idatha nanoma imiphi imisebenzi yokuvumelanisa.'
          },
          hr: {
            p1: 'Phatha abasebenzi, ukubakhona, nokubalwa kwemiholo.',
            li1: 'Sebenzisa ithuluzi lokuhlanza ukuze ususe abasebenzi besampula uma kudingeka.',
            li2: 'Qinisekisa ukuthi inani labasebenzi abasebenzayo alifaki i-Regular User; bheka izibalo ku-console.'
          },
          accounting: {
            p1: 'Buyekeza izitatimende zebhange, ukwamiswa kwezimali, nezinqubo ze-VAT/EMP201.',
            li1: 'Qinisekisa ukuthi izitatimende zilayishwa ku-localStorage; ama-log abonisa izinombolo nezibonelo.',
            li2: 'Izixwayiso ze-Recharts ziyolwazi; cabanga ngo-ResponsiveContainer ngosayizi oshintshayo.'
          },
          settings: {
            p1: 'Lungisa abasebenzisi, ukuphepha, idatha, imibiko, nokunye.',
            li1: 'Sebenzisa ithebhu ethi Abasebenzisi ukuphatha ama-admin; izixhumanisi ezijulile ezifana no-#admin-users zizozulazula ngokuzenzakalela.',
            li2: 'I-Diagnostics: kopisha imininingwane yemvelo futhi uhlole inethiwekhi kusuka kule thebhu yoSizo.'
          }
        },
        faqs: {
          title: 'Imibuzo Evame Ukubuzwa',
          q1: 'Ngixhumana kanjani nokusekela?',
          a1: 'Sebenzisa inkinobho ethi I-imeyili Yokusekela ngenhla noma ubhale ku-support@mokmzansibooks.com. Faka izithombe-skrini nezinyathelo.',
          q2: 'Ngisusa kanjani ama-spinner okulayisha abambekile?',
          a2: 'Sebenzisa "Phoqa ukuhlanza manje" ukuze ususe ama-toasts nama-spinner abambekile. Ungavula futhi i-Auto-clean ukuze igijime ngokuzenzakalelayo.',
          q3: 'Ingabe ukusula i-cache kuzongikhipha?',
          a3: 'Ukusula i-cache kususa idatha yendawo futhi kungakukhipha. Ungangena futhi noma usebenzise isenzo sokuSetha kabusha i-auth.'
        },
        toasts: {
          diagnosticsCopiedTitle: 'I-diagnostics ikopishiwe',
          diagnosticsCopiedDesc: 'Imininingwane ikopishwe kubhodi lokunamathisela. Namathisela emlayezo wakho wokusekela.',
          copyFailedTitle: 'Yehlulekile ukukopisha',
          copyFailedDesc: 'Ukufinyelela kubhodi lokunamathisela kuvinjiwe isiphequluli sakho.',
          networkOkTitle: 'Inethiwekhi ibukeka kahle',
          networkOkDesc: 'Isiphequluli sakho siku-inthanethi futhi uhlelo luyatholakala.',
          networkIssueTitle: 'Kutholwe inkinga yenethiwekhi',
          networkIssueDesc: 'Asikwazanga ukufinyelela umsuka wohlelo. Hlola ukuxhumeka kwakho.',
          autoCleanEnabledTitle: 'I-Auto-clean ivuliwe',
          autoCleanEnabledDesc: 'Sizokhipha ngezikhathi izaziso zokuvumelanisa ezibambekile.',
          autoCleanDisabledTitle: 'I-Auto-clean icishiwe',
          autoCleanDisabledDesc: 'Ukuhlanza ngezikhathi kumisiwe.',
          cacheClearedTitle: 'I-cache isulwe',
          cacheClearedDesc: 'Idatha yendawo isulwe ngempumelelo. Ilayisha kabusha…',
          cacheClearFailedTitle: 'Yehlulekile ukusula i-cache',
          cacheClearFailedDesc: 'Sicela uzame futhi noma uxhumane nokusekela.'
        },
        confirms: {
          clearCache: 'Lokhu kuzosula idatha yohlelo lwendawo futhi kungakukhipha. Qhubeka?',
          resetAuth: 'Setha kabusha i-auth yendawo bese ulayisha kabusha? Ama-akhawunti ezenzakalelayo azodalwa kabusha.'
        },
        mail: {
          subject: 'Isicelo Sokusekela - MOK Mzansi Books',
          body: 'Chaza inkinga yakho lapha...\n\n(Unganamathisela i-diagnostics oyikopishile lapha)'
        }
      },
      about: {
        title: 'Mayelana ne-MOK Mzansi Books',
        intro: 'I-MOK Mzansi Books iyisethi yebhizinisi ehlanganisiwe elula ukusebenza, kusukela eku-invoice kuya ekubikeni, egxile kokuhlangenwe nakho komsebenzisi okuhle nokusebenza kahle.',
        labels: {
          version: 'Inguqulo',
          environment: 'Imvelo',
          buildTime: 'Isikhathi Sokwakha',
          systemInformation: 'Ulwazi Lwesistimu'
        },
        buttons: {
          copyDiagnostics: 'Kopisha i-diagnostics',
          checkForUpdates: 'Hlola izibuyekezo',
          contactSupport: 'Xhumana nokusekela',
          website: 'Iwebhusayithi'
        },
        resources: {
          title: 'Izinsiza & Ezomthetho',
          privacy: 'Inqubomgomo Yobumfihlo',
          privacyDesc: 'Funda ukuthi siwuphatha kanjani umkhawulokudonsa wakho',
          terms: 'Imigomo Yesevisi',
          termsDesc: 'Funda imigomo yokusebenzisa lolu hlelo'
        },
        toasts: {
          diagnosticsCopiedTitle: 'I-diagnostics ikopishiwe',
          diagnosticsCopiedDesc: 'Imininingwane yesistimu ikopishwe kubhodi lokunamathisela.',
          copyFailedTitle: 'Ayikwazanga ukukopisha',
          copyFailedDesc: 'Isiphequluli sakho sivimbele ukufinyelela kubhodi lokunamathisela. Zama futhi.',
          upToDateTitle: 'Usendaweni yakamuva',
          upToDateDesc: 'Usebenzisa {{version}}. Azikho izibuyekezo okwamanje.'
        }
      },

      security: {
        title: 'Izilungiselelo Zokuphepha',
        // Password
        passwordSecurity: 'Ukuphepha Kwephasiwedi',
        requireStrongPasswords: 'Dinga Amaphasiwedi Aqine',
        enforcePasswordComplexity: 'Qinisa izimfuneko zobunzima bephasiwedi',
        requirementsTitle: 'Izidingo Zephasiwedi:',
        min8: 'Okungenani izinhlamvu ezingu-8',
        uppercase: 'Izinhlamvu ezinkulu (A-Z)',
        lowercase: 'Izinhlamvu ezincane (a-z)',
        numbers: 'Izinombolo (0-9)',
        specialChars: 'Izinhlamvu ezikhethekile (!@#$%^&*)',
        expiryDaysLabel: 'Ukuphela Kwephasiwedi (Izinsuku)',
        expiry30: 'Izinsuku ezingu-30',
        expiry60: 'Izinsuku ezingu-60',
        expiry90: 'Izinsuku ezingu-90',
        expiry180: 'Izinsuku ezingu-180',
        expiry365: 'Izinsuku ezingu-365',
        expiryHelp: 'Abasebenzisi bazodingeka baguqule iphasiwedi yabo ngemuva kwalesi sikhathi',
        // 2FA
        twoFactor: 'Ukuqinisekisa Okubili',
        enableTwoFactor: 'Nika amandla Ukuqinisekisa Okubili',
        twoFactorDesc: 'Dinga ikhodi yokuqinisekisa ngaphezu kwephasiwedi ekungeneni',
        twoFactorEnabledInfo: 'Ukuqinisekisa okubili kunikwe amandla. Abasebenzisi bazocelwa ukusetha i-2FA lapho bengena ngokuzayo.',
        // Session
        sessionSecurity: 'Ukuphepha Kweseshini',
        sessionTimeoutMinutes: 'Isikhathi Sokuphelelwa Kweseshi (Amaminithi)',
        timeout15: 'Imizuzu eyi-15',
        timeout30: 'Imizuzu engama-30',
        timeout60: 'Ihora eli-1',
        timeout120: 'Amahora amabili',
        timeout240: 'Amahora amane',
        autoLogoutHelp: 'Abasebenzisi bazophuma ngokuzenzakalela ngemuva kwalesi sikhathi sokungasebenzi',
        loginNotifications: 'Izaziso Zokungena',
        loginNotificationsDesc: 'Thumela izaziso ze-imeyili zokungena okusha',
        // Devices
        activeDevices: 'Amadivayisi Asebenzayo',
        currentDevice: 'Kamanje',
        // Buttons
        saveSettings: 'Londoloza Izilungiselelo',
        saving: 'Kugcina...',
        // Toasts
        savedTitle: 'Izilungiselelo zokuphepha zigcinwe ngempumelelo',
        savedDesc: 'Izintandokazi zakho zokuphepha zibuyekeziwe.',
        errorTitle: 'Iphutha',
        saveErrorDesc: 'Yehlulekile ukulondoloza izilungiselelo. Zama futhi.',
        deviceLoggedOutTitle: 'Idivayisi iphume',
        deviceLoggedOutDesc: 'Idivayisi iphume ngempumelelo.',
        deviceLogoutErrorTitle: 'Iphutha',
        deviceLogoutErrorDesc: 'Ayikwazanga ukuphuma kudivayisi ekhethiwe.'
      },
      notifications: {
        // Section titles
        emailNotifications: 'Izaziso ze-imeyili',
        inAppNotifications: 'Izaziso zangaphakathi kuhlelo',
        notificationFrequency: 'Imvamisa yezaziso',
        // Email section
        enableEmail: 'Nika amandla izaziso ze-imeyili',
        receiveViaEmail: 'Thola izaziso nge-imeyili',
        emailAddress: 'Ikheli le-imeyili',
        invoiceReminders: 'Izikhumbuzi zefektha',
        paymentDueReminders: 'Izikhumbuzi zesikweletu esikhokhelwayo',
        paymentReceived: 'Inkokhelo Itholiwe',
        paymentConfirmations: 'Ukuqinisekiswa kokukhokha',
        lowStockAlerts: 'Izexwayiso zesitokwe esiphansi',
        inventoryWarnings: 'Izexwayiso zesitokwe',
        systemAlerts: 'Izexwayiso zesistimu',
        systemMessages: 'Imilayezo ebalulekile yesistimu',
        // In-app section
        enableSound: 'Nika amandla Umsindo',
        playNotificationSounds: 'Dlala imisindo yezaziso',
        desktopNotifications: 'Izaziso zekhompyutha',
        showBrowserNotifications: 'Bonisa izaziso zebhrawuza',
        permissionNotGranted: 'Imvume ayikanikezwa okwamanje.',
        grantPermission: 'Nikeza imvume',
        desktopEnabled: 'Izaziso zekhompyutha zivuliwe',
        permissionDenied: 'Imvume yenqatshiwe kuzilungiselelo zebhrawuza',
        newInvoices: 'Ama-invoyisi amasha',
        invoiceCreationAlerts: 'Izexwayiso zokwenziwa kwe-invoyisi',
        taskReminders: 'Izikhumbuzi zemisebenzi',
        upcomingTaskNotifications: 'Izaziso zemisebenzi ezayo',
        // Frequency section
        invoiceReminderLabel: 'Isikhumbuzi se-invoyisi (izinsuku ngaphambi kosuku lokukhokha)',
        reportSchedule: 'Ishejuli yombiko',
        digestFrequency: 'Imvamisa yesifinyezo',
        day1: 'Usuku olu-1',
        days3: 'Izinsuku ezi-3',
        days7: 'Izinsuku ezi-7',
        days14: 'Izinsuku ezi-14',
        realtime: 'Isikhathi sangempela',
        daily: 'Nsuku zonke',
        weekly: 'Ngeviki',
        monthly: 'Ngenyanga',
        // Buttons & toasts
        save: 'Londoloza Izilungiselelo Zezaziso',
        saveSuccess: 'Izilungiselelo zezaziso zigcinwe ngempumelelo!',
        saveError: 'Yehlulekile ukulondoloza izilungiselelo zezaziso'
      },
      dataManagement: {
        title: 'Ukwengamela Idatha',
        storageUsage: 'Ukusetshenziswa Kwendawo Yokugcina Yendawo',
        refresh: 'Vuselela',
        ofMb: '{{used}} KB kwa {{total}} MB',
        keysCount: '{{count}} okhiye',
        exportTitle: 'Khipha Idatha',
        exportDesc: 'Landa isipele se-JSON sedatha yohlelo lwakho lokusebenza.',
        exportButton: 'Khipha Idatha',
        exporting: 'Iyakhishwa...',
        exportSuccessTitle: 'Ukukhipha kuphumelele',
        exportSuccessDesc: 'Ukukhishwa kwedatha kudalwe ngempumelelo',
        exportFailedTitle: 'Ukukhipha kwehlulekile',
        exportFailedDesc: 'Kwehlulekile ukukhipha idatha',
        importTitle: 'Ngenisa Idatha',
        importDesc: 'Buyisela idatha kusuka kufayela le-JSON elakhishwa ngaphambilini.',
        importButton: 'Ngenisa Idatha',
        importing: 'Iyangeniswa...',
        importSuccessTitle: 'Ukungenisa kuphumelele',
        importSuccessDesc: 'Kungeniswe izinto zedatha ezingu-{{count}}',
        importFailedTitle: 'Ukungenisa kwehlulekile',
        importFailedDesc: 'Kwehlulekile ukungenisa idatha. Sicela uhlole ifomethi yefayela.',
        clearAllTitle: 'Sula Yonke Idatha',
        clearAllDesc: 'Lokhu kuzosula unomphela yonke idatha yohlelo lokusebenza kubhrawuza wakho.',
        clearAllButton: 'Sula Yonke Idatha',
        confirmDeleteTitle: 'Sula yonke idatha yendawo?',
        confirmDeleteDesc: 'Lesi senzo asikwazi ukubuyiselwa emuva. Yonke idatha egciniwe ngokwendawo kuhlanganise nezinvoyisi, amakhasimende, nemibiko izosuswa.',
        clearSuccessTitle: 'Yonke idatha isuliwe',
        clearSuccessDesc: 'Yonke idatha yohlelo lokusebenza isuliwe',
        clearFailedTitle: 'Ukusula kwehlulekile',
        clearFailedDesc: 'Kwehlulekile ukusula idatha'
      },
      users: {
        totalAdminUsers: 'Inani Labasebenzisi Be-Admin',
        ceoLevel: 'Izinga le-CEO',
        managers: 'Abaphathi',
        directors: 'Abaqondisi',
        administrativeUsers: 'Abasebenzisi Bokuqondisa',
        refresh: 'Vuselela'
      }
    },
    // Common
    common: {
      save: 'Gcina',
      cancel: 'Khansela',
      edit: 'Hlela',
      delete: 'Susa',
      view: 'Buka',
      add: 'Engeza',
      update: 'Buyekeza',
      search: 'Sesha',
      filter: 'Hlunga',
      export: 'Khipha',
      import: 'Ngenisa',
      print: 'Phrinta',
      loading: 'Iyalayisha...',
      noData: 'Akukho idatha etholakalayo',
      error: 'Kukhona iphutha',
      success: 'Ukusebenza kuphumelele',
      confirm: 'Qinisekisa',
      yes: 'Yebo',
      no: 'Cha',
      close: 'Vala',
      back: 'Emuva',
      next: 'Okulandelayo',
      previous: 'Okwangaphambili',
      seconds: 'imizuzwana',
      submit: 'Ngenisa',
      reset: 'Phinda Umisele',
      signOut: 'Phuma',
      description: 'Inkcazelo',
      title: 'Isihloko',
      details: 'Imininingwane',
      overview: 'Ukubuka Konke',
      upload: 'Layisha',
      download: 'Landa',
      general: 'Okuvamile',
      newFolder: 'Ifolda Entsha',
      email: 'I-imeyili',
      password: 'Iphasiwedi',
      newPassword: 'Iphasiwedi Entsha',
      createPassword: 'Dala Iphasiwedi',
      newHires: 'Abaqeshwe Abatsha',
      newInvoices: 'Ama-invoice Amasha',
      reports: 'Imibiko',
      backToHome: 'Buyela Ekhaya',
      backToDashboard: 'Buyela Ebhodini Lokusebenza',
      recordExpense: 'Bhalela Indleko',
      activityLog: 'Irekhodi Yemisebenzi',
      trackActivities: 'Landela yonke imisebenzi nezinguquko ku-akhawunti yakho',
      downloadPDF: 'Landa i-PDF',
      searchActivities: 'Khangela imisebenzi...',
      allActivities: 'Yonke Imisebenzi',
      userActions: 'Izenzo Zomsebenzisi',
      documents: 'Amaxwebhu',
      security: 'Ukhuseleko',
      recentActivities: 'Imisebenzi Yakamuva',
      noActivitiesFound: 'Akukho misebenzi ifunyenweyo',
      adjustSearchFilters: 'Zama ukulungisa amagama akho okukhangela okanye izihluzi',
      projectBreakdown: 'Ukwahlulwa Kweprojekthi',
      automationLogs: 'Iilogi Zokuzenzekela',
      totalSalaryExpenses: 'Iindleko Zomvuzo Zizonke',
      noAutomationLogs: 'Akukho zilogi zokuzenzekela zifunyenweyo. Sebenzisa ukuzenzekela okwenziwa ngesandla ukuze ubone iilogi.',
      history: 'Imbali',
      reportDetails: 'Iinkcukacha Zengxelo',
      help: 'Usizo',
      refresh: 'Vuselela'
    }
  }
};
