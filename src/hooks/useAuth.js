import { useState, useCallback } from 'react';
import { authAPI } from '../services/api';

export const useAuth = () => {
  const [user, setUser] = useState(() => {
    try { const s = localStorage.getItem('lt_user'); return s ? JSON.parse(s) : null; }
    catch { return null; }
  });

  const login = useCallback(async (email, password) => {
    try {
      const res = await authAPI.login(email, password);
      const d = res.data?.data;
      if (d?.token) {
        const u = {
          name:    d.name,
          email:   d.email,
          role:    d.role,
          token:   d.token,
          hubId:   d.hubId   || null,
          hubName: d.hubName || null,
        };
        setUser(u);
        localStorage.setItem('lt_user', JSON.stringify(u));
        localStorage.setItem('lt_token', d.token);
        return { success: true, user: u };
      }
      return { success: false, error: res.data?.message || 'Login failed' };
    } catch (err) {
      const msg = err?.response?.data?.message || 'Cannot connect to server.';
      return { success: false, error: msg };
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('lt_user');
    localStorage.removeItem('lt_token');
  }, []);

  return { user, login, logout };
};
