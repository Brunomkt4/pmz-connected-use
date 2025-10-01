// Mock Authentication Service
export interface MockUser {
  id: string;
  email: string;
  created_at: string;
}

export interface MockSession {
  user: MockUser;
  access_token: string;
  expires_at: number;
}

const STORAGE_KEY = 'mock_auth_session';
const USERS_KEY = 'mock_users_db';

// Initialize with some default users
const initializeDefaultUsers = () => {
  const users = localStorage.getItem(USERS_KEY);
  if (!users) {
    const defaultUsers = [
      {
        id: 'user-supplier-1',
        email: 'supplier@example.com',
        password: 'password123',
        full_name: 'John Supplier',
        account_type_id: 1,
        company_name: 'ABC Meats Ltd'
      },
      {
        id: 'user-buyer-1',
        email: 'buyer@example.com',
        password: 'password123',
        full_name: 'Jane Buyer',
        account_type_id: 2,
        company_name: 'XYZ Imports'
      },
      {
        id: 'user-transport-1',
        email: 'transport@example.com',
        password: 'password123',
        full_name: 'Mike Transport',
        account_type_id: 3,
        company_name: 'FastShip Logistics'
      }
    ];
    localStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers));
  }
};

initializeDefaultUsers();

const getUsers = () => {
  const users = localStorage.getItem(USERS_KEY);
  return users ? JSON.parse(users) : [];
};

const saveUsers = (users: any[]) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const mockAuth = {
  getSession: (): MockSession | null => {
    const session = localStorage.getItem(STORAGE_KEY);
    if (!session) return null;
    
    const parsedSession = JSON.parse(session);
    // Check if session is expired
    if (parsedSession.expires_at < Date.now()) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsedSession;
  },

  signUp: async (email: string, password: string, fullName: string, accountTypeId: number, companyName?: string) => {
    const users = getUsers();
    
    // Check if user already exists
    if (users.find((u: any) => u.email === email)) {
      return { error: { message: 'User already registered' } };
    }

    const newUser = {
      id: `user-${Date.now()}`,
      email,
      password,
      full_name: fullName,
      account_type_id: accountTypeId,
      company_name: companyName || null,
      created_at: new Date().toISOString()
    };

    users.push(newUser);
    saveUsers(users);

    return { error: null };
  },

  signIn: async (email: string, password: string) => {
    const users = getUsers();
    const user = users.find((u: any) => u.email === email && u.password === password);

    if (!user) {
      return { error: { message: 'Invalid login credentials' } };
    }

    const session: MockSession = {
      user: {
        id: user.id,
        email: user.email,
        created_at: user.created_at
      },
      access_token: `mock-token-${Date.now()}`,
      expires_at: Date.now() + 3600000 // 1 hour
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    
    // Trigger storage event for other tabs/components
    window.dispatchEvent(new Event('storage'));

    return { error: null };
  },

  signOut: async () => {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event('storage'));
  },

  onAuthStateChange: (callback: (event: string, session: MockSession | null) => void) => {
    const handleStorageChange = () => {
      const session = mockAuth.getSession();
      callback(session ? 'SIGNED_IN' : 'SIGNED_OUT', session);
    };

    window.addEventListener('storage', handleStorageChange);

    // Call immediately with current session
    setTimeout(() => {
      const session = mockAuth.getSession();
      callback(session ? 'SIGNED_IN' : 'SIGNED_OUT', session);
    }, 0);

    return {
      unsubscribe: () => {
        window.removeEventListener('storage', handleStorageChange);
      }
    };
  },

  deleteAccount: async (userId: string) => {
    const users = getUsers();
    const filteredUsers = users.filter((u: any) => u.id !== userId);
    saveUsers(filteredUsers);
    
    // Clear session
    localStorage.removeItem(STORAGE_KEY);
    
    // Clear all user data
    const keysToRemove = [
      `mock_profile_${userId}`,
      `mock_company_${userId}`,
      `mock_supplier_${userId}`,
      `mock_buyer_${userId}`,
      `mock_carrier_${userId}`,
      `mock_bank_guarantee_${userId}`
    ];
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    return { error: null };
  }
};
