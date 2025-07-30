export interface ExpenseCategory {
  id: string;
  name: string;
  subcategories: string[];
  keywords: string[];
  vatDeductible: boolean;
  icon: string;
}

export interface CategorizedExpense {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
  subcategory?: string;
  confidence: number; // 0-1 confidence score
  vatDeductible: boolean;
  autoDetected: boolean;
  bankStatementId?: string;
  slipAttached?: boolean;
  slipUrl?: string;
  notes?: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedBy?: string;
  submittedDate: string;
}

class ExpenseCategorizationService {
  private static instance: ExpenseCategorizationService;
  
  public static getInstance(): ExpenseCategorizationService {
    if (!ExpenseCategorizationService.instance) {
      ExpenseCategorizationService.instance = new ExpenseCategorizationService();
    }
    return ExpenseCategorizationService.instance;
  }

  private categories: ExpenseCategory[] = [
    {
      id: 'operating',
      name: 'Operating Expenses',
      subcategories: ['Rent & Lease', 'Utilities', 'Salaries', 'Repairs', 'Security', 'Office Supplies', 'Cleaning'],
      keywords: [
        'rent', 'lease', 'electricity', 'water', 'gas', 'utilities', 'salary', 'wages',
        'repair', 'maintenance', 'security', 'guard', 'office supplies', 'stationery',
        'cleaning', 'janitorial', 'municipal', 'rates', 'taxes', 'property'
      ],
      vatDeductible: true,
      icon: '💼'
    },
    {
      id: 'cost_of_sales',
      name: 'Cost of Sales / Direct Costs',
      subcategories: ['Raw Materials', 'Hiring Equipment', 'Inventory', 'Subcontractors'],
      keywords: [
        'materials', 'inventory', 'stock', 'equipment hire', 'rental equipment',
        'subcontractor', 'contractor', 'supplier', 'wholesale', 'manufacturing',
        'production', 'direct cost', 'cogs'
      ],
      vatDeductible: true,
      icon: '🚚'
    },
    {
      id: 'marketing',
      name: 'Marketing & Advertising',
      subcategories: ['Ads', 'Promotions', 'Campaigns'],
      keywords: [
        'advertising', 'marketing', 'promotion', 'campaign', 'google ads', 'facebook ads',
        'social media', 'billboard', 'radio', 'tv', 'newspaper', 'magazine',
        'branding', 'design', 'website', 'seo', 'digital marketing'
      ],
      vatDeductible: true,
      icon: '📣'
    },
    {
      id: 'professional',
      name: 'Professional Services',
      subcategories: ['Legal', 'Accounting', 'Consulting'],
      keywords: [
        'legal', 'lawyer', 'attorney', 'accounting', 'accountant', 'audit',
        'consulting', 'consultant', 'professional fees', 'advisory',
        'tax preparation', 'bookkeeping', 'financial advice'
      ],
      vatDeductible: true,
      icon: '🧑‍💻'
    },
    {
      id: 'financial',
      name: 'Financial Expenses',
      subcategories: ['Bank Charges', 'Loan Interest', 'Insurance', 'Fines'],
      keywords: [
        'bank charges', 'bank fees', 'interest', 'loan', 'insurance', 'premium',
        'fine', 'penalty', 'overdraft', 'credit card', 'finance charges',
        'transaction fees', 'service fees'
      ],
      vatDeductible: false, // Most financial expenses are not VAT deductible
      icon: '🧾'
    },
    {
      id: 'it_software',
      name: 'IT & Software',
      subcategories: ['Subscriptions', 'Hosting', 'Software'],
      keywords: [
        'software', 'subscription', 'saas', 'hosting', 'domain', 'cloud',
        'microsoft', 'google workspace', 'office 365', 'adobe', 'antivirus',
        'backup', 'server', 'it support', 'computer', 'laptop', 'hardware'
      ],
      vatDeductible: true,
      icon: '🖥️'
    },
    {
      id: 'travel',
      name: 'Travel & Transport',
      subcategories: ['Fuel', 'Accommodation', 'Flights', 'Per Diems'],
      keywords: [
        'fuel', 'petrol', 'diesel', 'gas', 'accommodation', 'hotel', 'lodge',
        'flight', 'airline', 'travel', 'transport', 'uber', 'taxi', 'car rental',
        'per diem', 'meals', 'parking', 'toll', 'vehicle', 'maintenance'
      ],
      vatDeductible: true,
      icon: '🚗'
    },
    {
      id: 'regulatory',
      name: 'Regulatory & Government Fees',
      subcategories: ['SARS', 'CIPC', 'Workman\'s Comp'],
      keywords: [
        'sars', 'tax', 'vat', 'paye', 'uif', 'sdl', 'cipc', 'company registration',
        'annual return', 'workman compensation', 'workers comp', 'license',
        'permit', 'government', 'municipal', 'compliance'
      ],
      vatDeductible: false, // Government fees typically not VAT deductible
      icon: '🏛️'
    },
    {
      id: 'training',
      name: 'Training & Development',
      subcategories: ['Courses', 'Seminars'],
      keywords: [
        'training', 'course', 'seminar', 'workshop', 'conference', 'education',
        'certification', 'skills development', 'learning', 'development',
        'coaching', 'mentoring'
      ],
      vatDeductible: true,
      icon: '🎓'
    },
    {
      id: 'miscellaneous',
      name: 'Miscellaneous / Other',
      subcategories: ['Donations', 'Gifts', 'Entertainment', 'Sundry'],
      keywords: [
        'donation', 'charity', 'gift', 'entertainment', 'sundry', 'miscellaneous',
        'other', 'general', 'various', 'client entertainment', 'staff function'
      ],
      vatDeductible: false, // Entertainment and gifts typically not VAT deductible
      icon: '🎁'
    }
  ];

  /**
   * Categorize an expense based on description and amount
   */
  categorizeExpense(description: string, amount: number): {
    category: string;
    subcategory?: string;
    confidence: number;
    vatDeductible: boolean;
  } {
    const lowerDescription = description.toLowerCase();
    let bestMatch = {
      category: 'miscellaneous',
      subcategory: 'Sundry',
      confidence: 0.1,
      vatDeductible: false
    };

    for (const category of this.categories) {
      const matchScore = this.calculateMatchScore(lowerDescription, category, amount);
      
      if (matchScore > bestMatch.confidence) {
        const subcategory = this.findBestSubcategory(lowerDescription, category);
        bestMatch = {
          category: category.id,
          subcategory,
          confidence: matchScore,
          vatDeductible: category.vatDeductible
        };
      }
    }

    return bestMatch;
  }

  /**
   * Calculate match score for a category
   */
  private calculateMatchScore(description: string, category: ExpenseCategory, amount: number): number {
    let score = 0;
    const words = description.split(/\s+/);
    
    // Check keyword matches
    for (const keyword of category.keywords) {
      if (description.includes(keyword)) {
        score += 0.3; // Base score for keyword match
        
        // Bonus for exact word match
        if (words.includes(keyword)) {
          score += 0.2;
        }
        
        // Bonus for multiple keyword matches
        const keywordCount = category.keywords.filter(k => description.includes(k)).length;
        if (keywordCount > 1) {
          score += 0.1 * (keywordCount - 1);
        }
      }
    }
    
    // Amount-based adjustments
    score += this.getAmountBasedScore(amount, category.id);
    
    // Cap the score at 1.0
    return Math.min(score, 1.0);
  }

  /**
   * Get amount-based scoring adjustments
   */
  private getAmountBasedScore(amount: number, categoryId: string): number {
    // Typical amount ranges for different categories
    const amountRanges: Record<string, { min: number; max: number; bonus: number }[]> = {
      'operating': [
        { min: 1000, max: 50000, bonus: 0.1 }, // Rent, utilities
        { min: 50, max: 1000, bonus: 0.05 }    // Office supplies
      ],
      'financial': [
        { min: 10, max: 500, bonus: 0.1 }      // Bank charges, fees
      ],
      'travel': [
        { min: 20, max: 2000, bonus: 0.1 }     // Fuel, transport
      ],
      'it_software': [
        { min: 50, max: 5000, bonus: 0.1 }     // Software subscriptions
      ]
    };
    
    const ranges = amountRanges[categoryId];
    if (!ranges) return 0;
    
    for (const range of ranges) {
      if (amount >= range.min && amount <= range.max) {
        return range.bonus;
      }
    }
    
    return 0;
  }

  /**
   * Find the best subcategory match
   */
  private findBestSubcategory(description: string, category: ExpenseCategory): string {
    let bestSubcategory = category.subcategories[0]; // Default to first subcategory
    let bestScore = 0;
    
    for (const subcategory of category.subcategories) {
      const subcategoryWords = subcategory.toLowerCase().split(/\s+/);
      let score = 0;
      
      for (const word of subcategoryWords) {
        if (description.includes(word)) {
          score += 1;
        }
      }
      
      if (score > bestScore) {
        bestScore = score;
        bestSubcategory = subcategory;
      }
    }
    
    return bestSubcategory;
  }

  /**
   * Get all available categories
   */
  getCategories(): ExpenseCategory[] {
    return this.categories;
  }

  /**
   * Get category by ID
   */
  getCategoryById(id: string): ExpenseCategory | undefined {
    return this.categories.find(cat => cat.id === id);
  }

  /**
   * Get category display name
   */
  getCategoryDisplayName(categoryId: string): string {
    const category = this.getCategoryById(categoryId);
    return category ? category.name : 'Unknown Category';
  }

  /**
   * Check if category is VAT deductible
   */
  isVATDeductible(categoryId: string): boolean {
    const category = this.getCategoryById(categoryId);
    return category ? category.vatDeductible : false;
  }

  /**
   * Batch categorize multiple expenses
   */
  batchCategorizeExpenses(expenses: { description: string; amount: number }[]): {
    category: string;
    subcategory?: string;
    confidence: number;
    vatDeductible: boolean;
  }[] {
    return expenses.map(expense => this.categorizeExpense(expense.description, expense.amount));
  }

  /**
   * Update category based on user feedback (machine learning improvement)
   */
  updateCategoryFromFeedback(description: string, amount: number, correctCategory: string, correctSubcategory?: string): void {
    // In a production system, this would update the ML model
    // For now, we'll just log the feedback
    console.log('Category feedback received:', {
      description,
      amount,
      correctCategory,
      correctSubcategory
    });
    
    // Store feedback in localStorage for future improvements
    const feedback = JSON.parse(localStorage.getItem('categoryFeedback') || '[]');
    feedback.push({
      description,
      amount,
      correctCategory,
      correctSubcategory,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem('categoryFeedback', JSON.stringify(feedback));
  }
}

export default ExpenseCategorizationService.getInstance();