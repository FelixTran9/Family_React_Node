import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { Package, Truck, CheckCircle, XCircle } from 'lucide-react';
import API from '../services/api';

const Orders = () => {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!currentUser?.email) return;
      try {
        const res = await API.get(`/customers/${currentUser.email}/orders`);
        setOrders(res.data);
      } catch (err) {
        console.error("Lỗi lấy danh sách đơn hàng:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [currentUser]);

  if (!currentUser) {
    return <Navigate to="/" />;
  }

  const getStatusDisplay = (status) => {
    switch(status) {
      case 'đang_giao': 
        return <span className="flex items-center justify-center md:justify-start text-blue-600 bg-blue-50 px-4 py-1.5 rounded-full text-sm font-bold shadow-sm"><Truck className="w-4 h-4 mr-2" /> Đang giao hàng</span>;
      case 'đã_giao':
        return <span className="flex items-center justify-center md:justify-start text-green-600 bg-green-50 px-4 py-1.5 rounded-full text-sm font-bold shadow-sm"><CheckCircle className="w-4 h-4 mr-2" /> Giao thành công</span>;
      case 'đã_hủy':
      case 'giao_thất_bại':
        return <span className="flex items-center justify-center md:justify-start text-red-600 bg-red-50 px-4 py-1.5 rounded-full text-sm font-bold shadow-sm"><XCircle className="w-4 h-4 mr-2" /> {status === 'đã_hủy' ? 'Đã hủy' : 'Giao thất bại'}</span>;
      default:
        // chờ_xác_nhận, đã_xác_nhận
        return <span className="flex items-center justify-center md:justify-start text-orange-600 bg-orange-50 px-4 py-1.5 rounded-full text-sm font-bold shadow-sm"><Package className="w-4 h-4 mr-2" /> Đang xử lý</span>;
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-extrabold text-gray-800 mb-8 flex items-center">
          <span className="w-1.5 h-8 bg-cyan-600 rounded-full mr-4 block"></span>
          Đơn hàng của tôi
        </h1>

        <div className="space-y-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto mb-4"></div>
              <p className="text-gray-500 font-semibold">Đang tải lịch sử đơn hàng...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100 opacity-90">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Package className="w-12 h-12 text-gray-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-700 mb-4">Bạn chưa có đơn hàng nào</h2>
              <p className="text-gray-500 mb-6">Hãy khám phá các sản phẩm tuyệt vời của FamilyMart ngay nhé!</p>
            </div>
          ) : (
            orders.map(order => (
              <div key={order.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row items-start md:items-center justify-between hover:shadow-md transition">
                <div className="mb-4 md:mb-0">
                  <p className="text-xl font-extrabold text-gray-800 mb-1">Mã ĐH: <span className="text-cyan-700">{order.id}</span></p>
                  <p className="text-sm text-gray-500 mb-2">Ngày đặt: {order.date}</p>
                  <p className="inline-block bg-gray-100 text-gray-700 font-semibold px-3 py-1 rounded text-sm">{order.items} sản phẩm</p>
                </div>
                <div className="text-left md:text-right w-full md:w-auto flex flex-row md:flex-col justify-between md:justify-end items-center md:items-end">
                  <div className="mb-0 md:mb-3">
                    {getStatusDisplay(order.status)}
                  </div>
                  <p className="text-2xl font-bold text-cyan-600 drop-shadow-sm">
                    {Number(order.total || 0).toLocaleString('vi-VN')}đ
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Orders;
