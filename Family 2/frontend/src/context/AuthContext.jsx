import { createContext, useContext, useState, useEffect } from 'react';
import API from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('familyMartCurrentUser');
    return saved ? JSON.parse(saved) : null;
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authView, setAuthView] = useState('login'); // 'login' | 'register'

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('familyMartCurrentUser', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('familyMartCurrentUser');
    }
  }, [currentUser]);

  const login = async (loginId, password) => {
    try {
      const res = await API.post('/customers/login', { loginId });
      const user = res.data;
      setCurrentUser({ 
        name: user.TenKH, 
        email: user.Email || loginId, 
        phone: user.SDT,
        address: user.DiaChi,
        token: 'fake-token' 
      });
      setIsAuthModalOpen(false);
    } catch (err) {
      // Nếu chưa có tài khoản, giả lập tạo mới với Email
      setCurrentUser({ name: 'Khách Hàng', email: loginId, token: 'fake-token' });
      setIsAuthModalOpen(false);
    }
  };

  const register = async (name, email, phone, password) => {
    console.log('Register logic here with pwd length:', password.length);
    // Mocking success
    setCurrentUser({ name, email, phone, token: 'fake-token' });
    setIsAuthModalOpen(false);
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const openAuthModal = (view = 'login') => {
    setAuthView(view);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => setIsAuthModalOpen(false);

  return (
    <AuthContext.Provider value={{
      currentUser, 
      setCurrentUser, 
      login, 
      register, 
      logout,
      isAuthModalOpen,
      authView,
      openAuthModal,
      closeAuthModal,
      setAuthView
    }}>
      {children}
    </AuthContext.Provider>
  );
};
