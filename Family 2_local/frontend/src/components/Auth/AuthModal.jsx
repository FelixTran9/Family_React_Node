import { useAuth } from '../../context/AuthContext';
import { X } from 'lucide-react';
import { useState } from 'react';

const AuthModal = () => {
  const { isAuthModalOpen, closeAuthModal, authView, setAuthView, login, register } = useAuth();
  
  // States for forms
  const [loginId, setLoginId] = useState('');
  const [loginPwd, setLoginPwd] = useState('');

  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPwd, setRegPwd] = useState('');

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    login(loginId, loginPwd);
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    register(regName, regEmail, regPhone, regPwd);
  };

  if (!isAuthModalOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full relative">
        <button 
          onClick={closeAuthModal} 
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-6 h-6" />
        </button>

        {authView === 'login' ? (
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Đăng nhập</h2>
            <form onSubmit={handleLoginSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2">Email hoặc Số điện thoại</label>
                <input 
                  type="text" 
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-cyan-500 focus:outline-none"
                />
              </div>
              <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-2">Mật khẩu</label>
                <input 
                  type="password" 
                  value={loginPwd}
                  onChange={(e) => setLoginPwd(e.target.value)}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-cyan-500 focus:outline-none"
                />
              </div>
              <button 
                type="submit"
                className="w-full bg-cyan-600 text-white py-3 rounded-lg font-semibold hover:bg-cyan-700 transition mb-4"
              >
                Đăng nhập
              </button>
              <p className="text-center text-gray-600">
                Chưa có tài khoản?{' '}
                <button 
                  type="button" 
                  onClick={() => setAuthView('register')}
                  className="text-cyan-600 font-semibold hover:text-cyan-700"
                >
                  Đăng ký ngay
                </button>
              </p>
            </form>
          </div>
        ) : (
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Đăng ký</h2>
            <form onSubmit={handleRegisterSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2">Họ và tên</label>
                <input 
                  type="text" 
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-cyan-500 focus:outline-none"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2">Email</label>
                <input 
                  type="email" 
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-cyan-500 focus:outline-none"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2">Số điện thoại</label>
                <input 
                  type="tel" 
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-cyan-500 focus:outline-none"
                />
              </div>
              <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-2">Mật khẩu</label>
                <input 
                  type="password" 
                  value={regPwd}
                  onChange={(e) => setRegPwd(e.target.value)}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-cyan-500 focus:outline-none"
                />
              </div>
              <button 
                type="submit"
                className="w-full bg-cyan-600 text-white py-3 rounded-lg font-semibold hover:bg-cyan-700 transition mb-4"
              >
                Đăng ký
              </button>
              <p className="text-center text-gray-600">
                Đã có tài khoản?{' '}
                <button 
                  type="button" 
                  onClick={() => setAuthView('login')}
                  className="text-cyan-600 font-semibold hover:text-cyan-700"
                >
                  Đăng nhập
                </button>
              </p>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthModal;
