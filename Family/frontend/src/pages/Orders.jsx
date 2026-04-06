import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { Package, Truck, CheckCircle } from 'lucide-react';

const Orders = () => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <Navigate to="/" />;
  }

  // Mock dữ liệu đơn hàng
  const dummyOrders = [
    { id: 'FM-123456', date: '05/04/2026', total: 156000, status: 'delivering', items: 3 },
    { id: 'FM-123001', date: '01/04/2026', total: 42000, status: 'completed', items: 1 }
  ];

  const getStatusDisplay = (status) => {
    switch(status) {
      case 'delivering': 
        return <span className="flex items-center text-blue-600 bg-blue-50 px-3 py-1 rounded-full text-sm font-semibold"><Truck className="w-4 h-4 mr-1" /> Đang giao</span>;
      case 'completed':
        return <span className="flex items-center text-green-600 bg-green-50 px-3 py-1 rounded-full text-sm font-semibold"><CheckCircle className="w-4 h-4 mr-1" /> Đã giao</span>;
      default:
        return <span className="flex items-center text-gray-600 bg-gray-50 px-3 py-1 rounded-full text-sm font-semibold"><Package className="w-4 h-4 mr-1" /> Đang xử lý</span>;
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
          {dummyOrders.map(order => (
            <div key={order.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row items-start md:items-center justify-between">
              <div className="mb-4 md:mb-0">
                <p className="text-lg font-bold text-gray-800 mb-1">Mã ĐH: {order.id}</p>
                <p className="text-sm text-gray-500 mb-3">Ngày đặt: {order.date}</p>
                <p className="text-gray-700 font-medium">{order.items} sản phẩm</p>
              </div>
              <div className="text-left md:text-right w-full md:w-auto flex flex-row md:flex-col justify-between md:justify-end items-center md:items-end">
                <div className="mb-0 md:mb-3">
                  {getStatusDisplay(order.status)}
                </div>
                <p className="text-xl font-bold text-cyan-600">
                  {order.total.toLocaleString('vi-VN')}đ
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Orders;
