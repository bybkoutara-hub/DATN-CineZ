import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../api/apiService';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('cinez_user');
    if (savedUser) setUser(JSON.parse(savedUser));
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    const res = await authAPI.login(username, password);
    setUser(res.data.user);
    localStorage.setItem('cinez_user', JSON.stringify(res.data.user));
    localStorage.setItem('cinez_token', res.data.token);
    return res;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('cinez_user');
    localStorage.removeItem('cinez_token');
  };

  const isAdmin = user?.role === 'admin';
  const isStaff = user?.role === 'staff';

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, isAdmin, isStaff }}>
      {children}
    </AuthContext.Provider>
  );
};
