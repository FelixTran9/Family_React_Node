import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { User, Mail, Phone, MapPin, Save, X } from 'lucide-react';
import API from '../services/api';

const Account = () => {
  const { currentUser, setCurrentUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });

  useEffect(() => {
    if (currentUser) {
      setFormData({
        name: currentUser.name || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        address: currentUser.address || ''
      });
    }
  }, [currentUser]);

  if (!currentUser) {
    return <Navigate to="/" />; // Cần login
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // 1. Cập nhật lên CSDL backend qua API (Dùng Email làm gốc)
      if (currentUser.email) {
        await API.put(`/customers/${currentUser.email}`, {
          TenKH: formData.name,
          SDT: formData.phone,
          Email: formData.email,
          DiaChi: formData.address
        });
      }

      // 2. Cập nhật LocalStorage ở frontend
      setCurrentUser({
        ...currentUser,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address
      });
      setIsEditing(false);
      alert('Đã cập nhật thông tin thành công lên Database!');
    } catch (error) {
      alert('Có lỗi khi lưu thông tin: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-extrabold text-gray-800 mb-8 flex items-center">
          <span className="w-1.5 h-8 bg-cyan-600 rounded-full mr-4 block"></span>
          Tài khoản của tôi
        </h1>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="flex items-center space-x-6 mb-8 pb-8 border-b border-gray-100 relative">
            <div className="w-24 h-24 bg-cyan-100 rounded-full flex items-center justify-center text-cyan-600 text-4xl font-bold shadow-inner">
              {formData.name ? formData.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-800">{currentUser.name || 'Người dùng mới'}</h2>
              <span className="inline-block mt-2 bg-green-100 text-green-700 px-3 py-1.5 rounded-full text-sm font-bold border border-green-200">
                ⭐ Thành viên FamiPoint
              </span>
            </div>
            
            {!isEditing && (
               <button 
                onClick={() => setIsEditing(true)}
                className="absolute top-0 right-0 bg-cyan-50 text-cyan-700 px-5 py-2.5 rounded-xl font-bold hover:bg-cyan-100 hover:text-cyan-800 transition flex items-center shadow-sm"
              >
                ✏️ Chỉnh sửa hồ sơ
              </button>
            )}
          </div>

          <div className="space-y-6">
            <div className="flex items-center p-4 bg-gray-50 rounded-xl border border-gray-100 hover:shadow-sm transition">
              <User className="w-6 h-6 text-cyan-600 mr-4" />
              <div className="flex-1">
                <p className="text-sm text-gray-500 mb-1 font-semibold">Họ và tên</p>
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-semibold"
                    placeholder="Nhập họ và tên"
                  />
                ) : (
                  <p className="font-bold text-gray-800 text-lg">{currentUser.name || 'Chưa cập nhật'}</p>
                )}
              </div>
            </div>

            <div className="flex items-center p-4 bg-gray-50 rounded-xl border border-gray-100 hover:shadow-sm transition">
              <Mail className="w-6 h-6 text-cyan-600 mr-4" />
              <div className="flex-1">
                <p className="text-sm text-gray-500 mb-1 font-semibold">Email</p>
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-semibold"
                    placeholder="Nhập địa chỉ email"
                  />
                ) : (
                  <p className="font-bold text-gray-800 text-lg">{currentUser.email || 'Chưa cập nhật'}</p>
                )}
              </div>
            </div>

            <div className="flex items-center p-4 bg-gray-50 rounded-xl border border-gray-100 hover:shadow-sm transition">
              <Phone className="w-6 h-6 text-cyan-600 mr-4" />
              <div className="flex-1">
                <p className="text-sm text-gray-500 mb-1 font-semibold">Số điện thoại</p>
                {isEditing ? (
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-semibold"
                    placeholder="Nhập số điện thoại"
                  />
                ) : (
                  <p className="font-bold text-gray-800 text-lg">{currentUser.phone || 'Chưa cập nhật'}</p>
                )}
              </div>
            </div>

            <div className="flex items-center p-4 bg-gray-50 rounded-xl border border-gray-100 hover:shadow-sm transition">
              <MapPin className="w-6 h-6 text-cyan-600 mr-4" />
              <div className="flex-1">
                <p className="text-sm text-gray-500 mb-1 font-semibold">Địa chỉ giao hàng mặc định</p>
                {isEditing ? (
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-semibold"
                    placeholder="Nhập địa chỉ rõ ràng (Số nhà, Phường, Quận...)"
                  />
                ) : (
                  <p className="font-bold text-gray-800 text-lg">{currentUser.address || 'Chưa cập nhật địa chỉ'}</p>
                )}
              </div>
            </div>
          </div>

          {isEditing && (
            <div className="mt-8 pt-8 border-t border-gray-100 flex gap-4 animate-fade-in">
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="flex-[2] bg-cyan-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-cyan-700 transition shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSaving ? <span className="animate-spin text-white">🔄</span> : <Save className="w-5 h-5" />} 
                {isSaving ? 'Đang lưu...' : 'Lưu Thay Đổi'}
              </button>
              <button 
                onClick={() => {
                  setIsEditing(false);
                  setFormData({
                    name: currentUser.name || '',
                    email: currentUser.email || '',
                    phone: currentUser.phone || '',
                    address: currentUser.address || ''
                  });
                }}
                className="flex-1 bg-white border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-50 transition flex items-center justify-center gap-2"
              >
                <X className="w-5 h-5" /> Hủy bỏ
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Account;
