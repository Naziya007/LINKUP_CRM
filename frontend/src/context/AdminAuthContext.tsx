'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { adminFetch, getAuthToken, removeAuthToken, setAuthToken } from '@/lib/adminApi';

export interface Company {
  _id: string;
  name: string;
  slug: string;
  code: string;
  description?: string;
  isVisible: boolean;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  isSuperAdmin: boolean;
}

interface AdminAuthContextType {
  user: AdminUser | null;
  token: string | null;
  companies: Company[];
  selectedCompany: Company | null;
  setSelectedCompany: (company: Company | null) => void;
  loading: boolean;
  login: (token: string, user: AdminUser) => void;
  logout: () => void;
  refreshCompanies: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const initAuth = async () => {
      let storedToken = getAuthToken();

      // If no token exists, perform auto-login with default seeded admin credentials
      if (!storedToken) {
        try {
          const loginRes = await adminFetch('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email: 'admin@linkup.com', password: 'admin123' })
          });
          if (loginRes.success && loginRes.token) {
            setAuthToken(loginRes.token);
            storedToken = loginRes.token;
            setUser(loginRes.user);
            setToken(storedToken);
          }
        } catch {
          // If server auto-login fails, redirect to login page if on admin route
          if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
            router.push('/admin/login');
          }
        }
      }

      if (storedToken) {
        try {
          const res = await adminFetch('/auth/me');
          if (res.success && res.user) {
            setUser(res.user);
            setToken(storedToken);
          }
        } catch {
          // Re-attempt auto-login
          try {
            const reloginRes = await adminFetch('/auth/login', {
              method: 'POST',
              body: JSON.stringify({ email: 'admin@linkup.com', password: 'admin123' })
            });
            if (reloginRes.success && reloginRes.token) {
              setAuthToken(reloginRes.token);
              setUser(reloginRes.user);
              setToken(reloginRes.token);
            }
          } catch {
            // if auto -login fails, redirect to login page if on admin route
          }
        }
      }

      await fetchCompanies();
      setLoading(false);
    };

    initAuth();
  }, []);

  const fetchCompanies = async () => {
    try {
      const res = await adminFetch('/companies');
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        setCompanies(res.data);
        if (!selectedCompany || selectedCompany._id === 'all') {
          setSelectedCompany(res.data[0]); // Default to first company (e.g. Linkup Social)
        }
      }
    } catch {
      const fallbackComps: Company[] = [
        { _id: 'social-1', name: 'Linkup Social', slug: 'linkup-social', code: 'SOCIAL', isVisible: true },
        { _id: 'web-2', name: 'Linkup Web', slug: 'linkup-web', code: 'WEB', isVisible: true },
        { _id: 'legal-3', name: 'Linkup Legal', slug: 'linkup-legal', code: 'LEGAL', isVisible: true },
        { _id: 'finserv-4', name: 'Linkup Finserv', slug: 'linkup-finserv', code: 'FINSERV', isVisible: true },
      ];
      setCompanies(fallbackComps);
      if (!selectedCompany) setSelectedCompany(fallbackComps[0]);
    }
  };

  const login = (newToken: string, newUser: AdminUser) => {
    setAuthToken(newToken);
    setToken(newToken);
    setUser(newUser);
    fetchCompanies();
    router.push('/admin');
  };

  const logout = () => {
    removeAuthToken();
    setToken(null);
    setUser(null);
    if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
      router.push('/admin/login');
    }
  };

  return (
    <AdminAuthContext.Provider
      value={{
        user,
        token,
        companies,
        selectedCompany,
        setSelectedCompany,
        loading,
        login,
        logout,
        refreshCompanies: fetchCompanies,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};
