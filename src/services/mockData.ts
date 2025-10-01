// Mock Data Service for all database entities

export const accountTypes = [
  { id: 1, name: 'Supplier', description: 'Meat product suppliers and exporters', created_at: new Date().toISOString() },
  { id: 2, name: 'Buyer', description: 'International meat importers and distributors', created_at: new Date().toISOString() },
  { id: 3, name: 'Transport', description: 'Logistics and shipping companies', created_at: new Date().toISOString() },
  { id: 4, name: 'Bank', description: 'Financial institutions providing trade finance', created_at: new Date().toISOString() },
  { id: 5, name: 'Certification', description: 'Certification and inspection bodies', created_at: new Date().toISOString() }
];

// Profile operations
export const mockProfiles = {
  get: (userId: string) => {
    const key = `mock_profile_${userId}`;
    const stored = localStorage.getItem(key);
    if (stored) return JSON.parse(stored);

    // Get user from users db
    const users = localStorage.getItem('mock_users_db');
    if (!users) return null;
    
    const usersList = JSON.parse(users);
    const user = usersList.find((u: any) => u.id === userId);
    
    if (!user) return null;

    const profile = {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      account_type_id: user.account_type_id,
      phone: null,
      language: 'en',
      timezone: 'UTC',
      notifications_enabled: true,
      date_format: 'MM/DD/YYYY',
      created_at: user.created_at,
      updated_at: user.created_at
    };

    localStorage.setItem(key, JSON.stringify(profile));
    return profile;
  },

  update: (userId: string, updates: any) => {
    const key = `mock_profile_${userId}`;
    const current = mockProfiles.get(userId);
    if (!current) return { error: { message: 'Profile not found' } };

    const updated = {
      ...current,
      ...updates,
      updated_at: new Date().toISOString()
    };

    localStorage.setItem(key, JSON.stringify(updated));
    return { data: updated, error: null };
  }
};

// Company operations
export const mockCompanies = {
  get: (userId: string) => {
    const key = `mock_company_${userId}`;
    const stored = localStorage.getItem(key);
    if (stored) return JSON.parse(stored);

    // Check if user has company from signup
    const users = localStorage.getItem('mock_users_db');
    if (!users) return null;
    
    const usersList = JSON.parse(users);
    const user = usersList.find((u: any) => u.id === userId);
    
    if (!user || !user.company_name) return null;

    const company = {
      id: `company-${userId}`,
      user_id: userId,
      name: user.company_name,
      email: user.email,
      phone: '',
      address: '',
      cnpj: '',
      account_type_id: user.account_type_id,
      created_at: user.created_at,
      updated_at: user.created_at
    };

    localStorage.setItem(key, JSON.stringify(company));
    return company;
  },

  upsert: (userId: string, data: any) => {
    const key = `mock_company_${userId}`;
    const company = {
      id: data.id || `company-${userId}`,
      user_id: userId,
      ...data,
      updated_at: new Date().toISOString()
    };

    localStorage.setItem(key, JSON.stringify(company));
    return { data: company, error: null };
  }
};

// Supplier operations
export const mockSuppliers = {
  get: (userId: string) => {
    const key = `mock_supplier_${userId}`;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : null;
  },

  upsert: (userId: string, data: any) => {
    const key = `mock_supplier_${userId}`;
    const supplier = {
      id: data.id || `supplier-${userId}`,
      user_id: userId,
      ...data,
      updated_at: new Date().toISOString()
    };

    localStorage.setItem(key, JSON.stringify(supplier));
    return { data: supplier, error: null };
  }
};

// Buyer operations
export const mockBuyers = {
  get: (userId: string) => {
    const key = `mock_buyer_${userId}`;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : null;
  },

  upsert: (userId: string, data: any) => {
    const key = `mock_buyer_${userId}`;
    const buyer = {
      id: data.id || `buyer-${userId}`,
      user_id: userId,
      ...data,
      updated_at: new Date().toISOString()
    };

    localStorage.setItem(key, JSON.stringify(buyer));
    return { data: buyer, error: null };
  }
};

// Carrier operations
export const mockCarriers = {
  get: (userId: string) => {
    const key = `mock_carrier_${userId}`;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : null;
  },

  upsert: (userId: string, data: any) => {
    const key = `mock_carrier_${userId}`;
    const carrier = {
      id: data.id || `carrier-${userId}`,
      user_id: userId,
      ...data,
      updated_at: new Date().toISOString()
    };

    localStorage.setItem(key, JSON.stringify(carrier));
    return { data: carrier, error: null };
  }
};

// Bank Guarantee operations
export const mockBankGuarantees = {
  get: (userId: string) => {
    const key = `mock_bank_guarantee_${userId}`;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : null;
  },

  upsert: (userId: string, data: any) => {
    const key = `mock_bank_guarantee_${userId}`;
    const guarantee = {
      id: data.id || `guarantee-${userId}`,
      user_id: userId,
      ...data,
      updated_at: new Date().toISOString()
    };

    localStorage.setItem(key, JSON.stringify(guarantee));
    return { data: guarantee, error: null };
  }
};
