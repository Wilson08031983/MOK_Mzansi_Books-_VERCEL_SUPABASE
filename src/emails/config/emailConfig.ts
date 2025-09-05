// Email configuration for MOK Mzansi Books
export const emailConfig = {
  company: {
    name: 'MOK Mzansi Books',
    email: 'support@mokmzansibooks.co.za',
    phone: '+27 64 550 4029',
    address: '81 Monokane Street, Atterigeville X17, Pretoria, Gauteng, 0006',
    website: 'https://mokmzansibooks.co.za',
    logo: '/logo.png', // Path to your logo in the public folder
  },
  sender: {
    name: 'Wilson Mokgethwa Moabelo',
    email: 'support@mokmzansibooks.co.za',
    signature: 'Wilson Mokgethwa Moabelo\nMOK Mzansi Books',
  },
  notifications: {
    lowStock: {
      subject: 'Low Stock Alert - Action Required',
      recipients: ['support@mokmzansibooks.co.za'], // Add more recipients as needed
      threshold: 5, // Number of days before restocking is needed
    },
  },
  // Email template settings
  templates: {
    colors: {
      primary: '#2563eb', // Blue
      secondary: '#4f46e5', // Indigo
      success: '#10b981', // Green
      warning: '#f59e0b', // Amber
      danger: '#ef4444', // Red
      background: '#f8fafc', // Light gray
      text: '#1e293b', // Slate 800
      textLight: '#64748b', // Slate 500
    },
    typography: {
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontSize: '16px',
      lineHeight: '1.5',
    },
  },
};

export default emailConfig;
