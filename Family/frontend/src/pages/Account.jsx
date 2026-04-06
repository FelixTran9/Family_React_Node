import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { User, Mail, Phone, MapPin } from 'lucide-react';

const Account = () => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <Navigate to="/" />; // Cần login
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-extrabold text-gray-800 mb-8 flex items-center">
          <span className="w-1.5 h-8 bg-cyan-600 rounded-full mr-4 block"></span>
          Tài khoản của tôi
        </h1>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="flex items-center space-x-6 mb-8 pb-8 border-b border-gray-100">
            <div className="w-24 h-24 bg-cyan-100 rounded-full flex items-center justify-center text-cyan-600 text-4xl font-bold">
              {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{currentUser.name || 'Người dùng'}</h2>
              <span className="inline-block mt-2 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                Thành viên FamiPoint
              </span>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center p-4 bg-gray-50 rounded-xl">
              <User className="w-6 h-6 text-cyan-600 mr-4" />
              <div>
                <p className="text-sm text-gray-500 mb-1">Họ và tên</p>
                <p className="font-semibold text-gray-800">{currentUser.name || 'Chưa cập nhật'}</p>
              </div>
            </div>

            <div className="flex items-center p-4 bg-gray-50 rounded-xl">
              <Mail className="w-6 h-6 text-cyan-600 mr-4" />
              <div>
                <p className="text-sm text-gray-500 mb-1">Email</p>
                <p className="font-semibold text-gray-800">{currentUser.email || 'Chưa cập nhật'}</p>
              </div>
            </div>

            <div className="flex items-center p-4 bg-gray-50 rounded-xl">
              <Phone className="w-6 h-6 text-cyan-600 mr-4" />
              <div>
                <p className="text-sm text-gray-500 mb-1">Số điện thoại</p>
                <p className="font-semibold text-gray-800">{currentUser.phone || 'Chưa cập nhật'}</p>
              </div>
            </div>

            <div className="flex items-center p-4 bg-gray-50 rounded-xl">
              <MapPin className="w-6 h-6 text-cyan-600 mr-4" />
              <div>
                <p className="text-sm text-gray-500 mb-1">Địa chỉ giao hàng mặc định</p>
                <p className="font-semibold text-gray-800">Chưa cập nhật địa chỉ</p>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-100">
            <button className="bg-cyan-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-cyan-700 transition">
              Chỉnh sửa thông tin
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;
