import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Trash2, Plus, Minus } from 'lucide-react';
import { Link } from 'react-router-dom';

const Cart = () => {
  const { cart, updateQuantity, removeFromCart, cartTotal } = useCart();
  const { currentUser, openAuthModal } = useAuth();

  const handleCheckout = () => {
    if (!currentUser) {
      openAuthModal('login');
      return;
    }
    // Thanh toán logic
    alert('Đặt hàng thành công!');
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-extrabold text-gray-800 mb-8 flex items-center">
        <span className="w-1.5 h-8 bg-cyan-600 rounded-full mr-4 block"></span>
        Giỏ hàng của bạn
      </h1>

      {cart.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
          <img src="https://cdni.iconscout.com/illustration/premium/thumb/empty-cart-7359557-6024626.png" alt="Empty Cart" className="w-64 mx-auto mb-6 opacity-75" />
          <h2 className="text-2xl font-bold text-gray-700 mb-4">Không có sản phẩm nào trong giỏ</h2>
          <Link to="/special-offers" className="inline-block bg-cyan-600 text-white px-8 py-3 rounded-full font-bold hover:bg-cyan-700 transition">
            Tiếp tục mua sắm
          </Link>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-2/3">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b text-gray-500 uppercase text-sm">
                      <th className="pb-4 font-semibold">Sản phẩm</th>
                      <th className="pb-4 font-semibold text-center">Đơn giá</th>
                      <th className="pb-4 font-semibold text-center">Số lượng</th>
                      <th className="pb-4 font-semibold text-right">Tạm tính</th>
                      <th className="pb-4"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {cart.map((item) => (
                      <tr key={item.product_code} className="border-b last:border-0">
                        <td className="py-4">
                          <div className="flex items-center space-x-4">
                            <img src={item.image || 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=100'} alt={item.name} className="w-20 h-20 object-cover rounded-lg bg-gray-50" />
                            <span className="font-semibold text-gray-800 line-clamp-2">{item.name}</span>
                          </div>
                        </td>
                        <td className="py-4 text-center font-medium text-gray-600">
                          {parseFloat(item.price).toLocaleString('vi-VN')}đ
                        </td>
                        <td className="py-4">
                          <div className="flex items-center justify-center space-x-2">
                            <button 
                              onClick={() => updateQuantity(item.product_code, item.quantity - 1)}
                              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition"
                            >
                              <Minus className="w-4 h-4 text-gray-600" />
                            </button>
                            <span className="font-semibold w-8 text-center">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item.product_code, item.quantity + 1)}
                              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition"
                            >
                              <Plus className="w-4 h-4 text-gray-600" />
                            </button>
                          </div>
                        </td>
                        <td className="py-4 text-right font-bold text-cyan-600">
                          {(item.price * item.quantity).toLocaleString('vi-VN')}đ
                        </td>
                        <td className="py-4 text-right">
                          <button 
                            onClick={() => removeFromCart(item.product_code)}
                            className="text-red-500 hover:text-red-700 p-2 bg-red-50 rounded-full transition"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="lg:w-1/3">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
              <h3 className="text-xl font-bold text-gray-800 mb-6 border-b pb-4">Tóm tắt đơn hàng</h3>
              <div className="flex justify-between mb-4 text-gray-600">
                <span>Tạm tính:</span>
                <span className="font-semibold">{cartTotal.toLocaleString('vi-VN')}đ</span>
              </div>
              <div className="flex justify-between mb-6 text-gray-600">
                <span>Trạng thái:</span>
                <span className="text-green-500 font-semibold">Giao hàng miễn phí</span>
              </div>
              <div className="flex justify-between items-center border-t pt-4 mb-8">
                <span className="text-xl font-bold text-gray-800">Tổng cộng:</span>
                <span className="text-3xl font-black text-cyan-600">{cartTotal.toLocaleString('vi-VN')}đ</span>
              </div>
              <button 
                onClick={handleCheckout}
                className="w-full bg-cyan-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-cyan-700 transition shadow-lg hover:shadow-cyan-600/30"
              >
                Tiến hành đặt hàng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
