// Local authentication service to handle user authentication and role-based access
// without requiring Supabase cloud connection

interface UserCredentials {
  email: string;
  password: string;
  role?: string; // Added role to user credentials
}

interface User {
  id: string;
  email: string;
  user_metadata: {
    role?: string;
    first_name?: string;
    last_name?: string;
    company_name?: string;
    phone?: string;
    [key: string]: string | undefined | boolean | number;
  };
}

// List of admin roles with full access to edit company details
const ADMIN_ROLES = ['CEO', 'Manager', 'Bookkeeper', 'Director', 'Founder'];

// Check if the user is an admin based on their role
export const isAdminUser = (user: User | null): boolean => {
  if (!user || !user.user_metadata || !user.user_metadata.role) {
    return false;
  }
  
  return ADMIN_ROLES.includes(user.user_metadata.role);
};

// Authenticate user with email and password
export const authenticateUser = async (email: string, password: string): Promise<{ user: User | null; error: string | null }> => {
  try {
    // Get stored credentials from localStorage
    const storedCredentials = localStorage.getItem('userCredentials');
    if (!storedCredentials) {
      return { user: null, error: 'No credentials found' };
    }
    
    const credentials = JSON.parse(storedCredentials) as Record<string, UserCredentials>;
    
    // Find the user with matching email
    const userEntry = Object.entries(credentials).find(([_, cred]) => cred.email === email);
    
    if (!userEntry || userEntry[1].password !== password) {
      return { user: null, error: 'Invalid email or password' };
    }
    
    // Get user id and credentials
    const [userId, userCred] = userEntry;
    
    // Create a user object with the correct role from credentials
    const user: User = {
      id: userId,
      email: userCred.email,
      user_metadata: {
        role: userCred.role || '',
        first_name: 'User',
        last_name: 'Account',
        company_name: 'MOK Mzansi Books',
        phone: ''
      }
    };
    
    // Return the authenticated user with the correct role
    return { user, error: null };
  } catch (error) {
    console.error('Authentication error:', error);
    return { user: null, error: 'Authentication failed' };
  }
};

// Verify if user has admin permission
export const verifyAdminPermission = async (email: string, password: string): Promise<boolean> => {
  // First authenticate the user
  const { user, error } = await authenticateUser(email, password);
  
  if (error || !user) {
    return false;
  }
  
  // Check if the user has an admin role
  return isAdminUser(user);
};

// Initialize with some default users for testing if none exist
export const initializeLocalAuth = (): void => {
  // Always clear existing credentials to ensure proper setup
  localStorage.removeItem('userCredentials');
  
  // Create users with different roles for testing
  const defaultCredentials = {
    'user1': {
      email: 'admin@mokmzansibooks.com',
      password: 'admin123',
      role: 'Manager'  // This is an admin role
    },
    'user2': {
      email: 'user@mokmzansibooks.com',
      password: 'user123',
      role: 'Staff'    // This is NOT an admin role
    },
    'user3': {
      email: 'ceo@mokmzansibooks.com',
      password: 'ceo123',
      role: 'CEO'      // Another admin role for testing
    },
    'user4': {
      email: 'bookkeeper@mokmzansibooks.com',
      password: 'book123',
      role: 'Bookkeeper' // Another admin role for testing
    }
  };
  
  // Save the updated user credentials
  localStorage.setItem('userCredentials', JSON.stringify(defaultCredentials));
  
  // Log initialization
  console.log('Authentication system initialized with test users');
  console.log('- Admin users: admin@mokmzansibooks.com, ceo@mokmzansibooks.com, bookkeeper@mokmzansibooks.com');
  console.log('- Regular user: user@mokmzansibooks.com');
};

// Helper function to reset auth state (for testing)
export const resetAuthState = (): void => {
  localStorage.removeItem('userCredentials');
  console.log('Auth state reset. Call initializeLocalAuth() to reinitialize.');
};
