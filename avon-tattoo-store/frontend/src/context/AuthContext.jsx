import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Customer Session State
  const [customerUser, setCustomerUser] = useState(() => {
    const saved = localStorage.getItem('avon_customer_data');
    if (!saved) {
      const oldSaved = localStorage.getItem('avon_user_data');
      if (oldSaved) {
        try {
          const parsed = JSON.parse(oldSaved);
          if (parsed.role !== 'admin') return parsed;
        } catch (e) {}
      }
    }
    return saved ? JSON.parse(saved) : null;
  });

  const [customerToken, setCustomerToken] = useState(() => {
    const tok = localStorage.getItem('avon_customer_token');
    if (!tok) {
      const oldData = localStorage.getItem('avon_user_data');
      if (oldData) {
        try {
          const parsed = JSON.parse(oldData);
          if (parsed.role !== 'admin') return localStorage.getItem('avon_jwt_token');
        } catch (e) {}
      }
    }
    return tok;
  });

  // Admin Session State
  const [adminUser, setAdminUser] = useState(() => {
    const saved = localStorage.getItem('avon_admin_data');
    if (!saved) {
      const oldSaved = localStorage.getItem('avon_user_data');
      if (oldSaved) {
        try {
          const parsed = JSON.parse(oldSaved);
          if (parsed.role === 'admin') return parsed;
        } catch (e) {}
      }
    }
    return saved ? JSON.parse(saved) : null;
  });

  const [adminToken, setAdminToken] = useState(() => {
    const tok = localStorage.getItem('avon_admin_token');
    if (!tok) {
      const oldData = localStorage.getItem('avon_user_data');
      if (oldData) {
        try {
          const parsed = JSON.parse(oldData);
          if (parsed.role === 'admin') return localStorage.getItem('avon_jwt_token');
        } catch (e) {}
      }
    }
    return tok;
  });

  const [loading, setLoading] = useState(true);

  const logoutCustomer = () => {
    setCustomerToken(null);
    setCustomerUser(null);
    localStorage.removeItem('avon_customer_token');
    localStorage.removeItem('avon_customer_data');
  };

  const logoutAdmin = () => {
    setAdminToken(null);
    setAdminUser(null);
    localStorage.removeItem('avon_admin_token');
    localStorage.removeItem('avon_admin_data');
  };

  useEffect(() => {
    const initAuth = async () => {
      // Clean up legacy keys
      localStorage.removeItem('avon_jwt_token');
      localStorage.removeItem('avon_user_data');

      if (customerToken) {
        try {
          const data = await authService.getProfile(customerToken);
          if (data && data.user && data.user.role !== 'admin') {
            setCustomerUser(data.user);
            localStorage.setItem('avon_customer_data', JSON.stringify(data.user));
          } else {
            logoutCustomer();
          }
        } catch (err) {
          logoutCustomer();
        }
      }

      if (adminToken) {
        try {
          const data = await authService.getProfile(adminToken);
          if (data && data.user && data.user.role === 'admin') {
            setAdminUser(data.user);
            localStorage.setItem('avon_admin_data', JSON.stringify(data.user));
          } else {
            logoutAdmin();
          }
        } catch (err) {
          logoutAdmin();
        }
      }

      setLoading(false);
    };

    initAuth();
  }, []);

  const loginCustomer = async (email, password) => {
    const data = await authService.login(email, password, 'user');
    if (data.token && data.user) {
      if (data.user.role === 'admin') {
        throw new Error('Admin accounts cannot log in through the customer panel. Please use the Studio Admin Portal.');
      }
      setCustomerToken(data.token);
      setCustomerUser(data.user);
      localStorage.setItem('avon_customer_token', data.token);
      localStorage.setItem('avon_customer_data', JSON.stringify(data.user));
    }
    return data;
  };

  const loginAdmin = async (email, password) => {
    const data = await authService.login(email, password, 'admin');
    if (data.token && data.user) {
      if (data.user.role !== 'admin') {
        throw new Error('Access Denied: Customer accounts cannot log in to the Studio Admin Portal.');
      }
      setAdminToken(data.token);
      setAdminUser(data.user);
      localStorage.setItem('avon_admin_token', data.token);
      localStorage.setItem('avon_admin_data', JSON.stringify(data.user));
    }
    return data;
  };

  const login = async (email, password, portal = 'user') => {
    if (portal === 'admin') {
      return await loginAdmin(email, password);
    } else {
      return await loginCustomer(email, password);
    }
  };

  const register = async (name, email, password, phone) => {
    const data = await authService.register(name, email, password, phone);
    if (data.token && data.user) {
      setCustomerToken(data.token);
      setCustomerUser(data.user);
      localStorage.setItem('avon_customer_token', data.token);
      localStorage.setItem('avon_customer_data', JSON.stringify(data.user));
    }
    return data;
  };

  const logout = (portal = 'user') => {
    if (portal === 'admin') {
      logoutAdmin();
    } else if (portal === 'all') {
      logoutCustomer();
      logoutAdmin();
    } else {
      logoutCustomer();
    }
  };

  const isAdmin = !!adminToken && adminUser?.role === 'admin';
  const isAuthenticated = !!customerToken && customerUser?.role !== 'admin';

  return (
    <AuthContext.Provider
      value={{
        // Customer session (Storefront)
        user: customerUser,
        token: customerToken,
        isAuthenticated,
        
        // Admin session (Control Panel)
        adminUser,
        adminToken,
        isAdmin,

        loading,
        login,
        loginCustomer,
        loginAdmin,
        register,
        logout,
        logoutCustomer,
        logoutAdmin
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

