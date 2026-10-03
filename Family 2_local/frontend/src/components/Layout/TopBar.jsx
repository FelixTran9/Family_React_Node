import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { User, LogOut, ShoppingBag, Settings, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

const TopBar = () => {
  const { currentUser, logout, openAuthModal } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="bg-white border-b relative z-[60]">
      <div className="container mx-auto px-4 py-2 flex justify-between items-center text-sm">
        <div className="flex items-center space-x-4">
          <span className="text-gray-600">📞 Hotline: 037 703 8778</span>
          <span className="hidden md:inline text-gray-600">✉️ cskh@famima.vn</span>
        </div>
        <div className="flex items-center space-x-4">
          <Link to="/about" className="text-gray-600 hover:text-cyan-600">Về FamilyMart</Link>
          <Link to="/policy" className="text-gray-600 hover:text-cyan-600">Chính sách</Link>
          <Link to="/recruitment" className="text-gray-600 hover:text-cyan-600">Tuyển dụng</Link>
          
          {!currentUser ? (
            <div>
              <button 
                onClick={() => openAuthModal('login')} 
                className="text-cyan-600 font-semibold hover:text-cyan-700"
              >
                Đăng nhập
              </button>
            </div>
          ) : (
            <div className="relative" ref={menuRef}>
              <button 
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center space-x-2 text-gray-700 hover:text-cyan-600"
              >
                <div className="w-8 h-8 bg-cyan-600 rounded-full flex items-center justify-center text-white font-semibold">
                  <span>{currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}</span>
                </div>
                <ChevronDown className="w-4 h-4" />
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-2xl border border-gray-200 z-50">
                  <div className="p-4 border-b">
                    <p className="font-semibold text-gray-800">{currentUser.name}</p>
                    <p className="text-sm text-gray-600">{currentUser.email}</p>
                  </div>
                  <div className="py-2">
                    <Link to="/account" onClick={() => setMenuOpen(false)} className="px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center">
                      <Settings className="w-5 h-5 mr-2" /> Tài khoản của tôi
                    </Link>
                    <Link to="/orders" onClick={() => setMenuOpen(false)} className="px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center">
                      <ShoppingBag className="w-5 h-5 mr-2" /> Đơn hàng của tôi
                    </Link>
                    <button 
                      onClick={() => {
                        logout();
                        setMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 flex items-center"
                    >
                      <LogOut className="w-5 h-5 mr-2" /> Đăng xuất
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopBar;
