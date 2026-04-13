import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { Trash2, Plus, Minus } from 'lucide-react';
import { Link } from 'react-router-dom';
import API from '../services/api';

const Cart = () => {
  const { cart, updateQuantity, removeFromCart, cartTotal, clearCart } = useCart();

  // Form thông tin khách hàng
  const [step, setStep] = useState('cart'); // 'cart' | 'checkout' | 'success'
  const [successInfo, setSuccessInfo] = useState(null);
  const [form, setForm] = useState({
    TenKH: '', SDT: '', DiaChi: '', Email: '', HinhThucTT: 'Tiền mặt'
  });
  const [formError, setFormError] = useState('');
  const [placing, setPlacing] = useState(false);

  const handleFormChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleCheckout = () => {
    if (cart.length === 0) return;
    setStep('checkout');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!form.TenKH || !form.SDT) {
      setFormError('Vui lòng điền Họ tên và Số điện thoại');
      return;
    }
    setFormError('');
    setPlacing(true);
    try {
      const items = cart.map(item => ({
        MaSP: item.product_code,
        SoLuong: item.quantity,
      }));
      const res = await API.post('/orders', {
        TenKH: form.TenKH,
        SDT: form.SDT,
        DiaChi: form.DiaChi,
        Email: form.Email,
        HinhThucTT: form.HinhThucTT,
        items,
      });
      clearCart();
      setSuccessInfo(res.data);
      setStep('success');
    } catch (err) {
      setFormError(err.response?.data?.message || 'Lỗi đặt hàng. Vui lòng thử lại.');
    } finally {
      setPlacing(false);
    }
  };

  // --- Trang thành công ---
  if (step === 'success') {
    return (
      <div className="container mx-auto px-4 py-16 max-w-xl text-center">
        <div className="bg-white rounded-3xl shadow-lg p-10 border border-gray-100">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-3xl font-extrabold text-gray-800 mb-2">Đặt hàng thành công!</h1>
          <p className="text-gray-500 mb-6">Cảm ơn bạn đã mua hàng tại FamilyMart</p>
          <div className="bg-cyan-50 rounded-2xl p-4 text-left mb-6">
            <p className="text-sm text-gray-600 mb-1"><strong>Mã đơn hàng:</strong> <span className="text-cyan-700 font-bold">{successInfo?.MaDon}</span></p>
            <p className="text-sm text-gray-600 mb-1"><strong>Họ tên:</strong> {form.TenKH}</p>
            <p className="text-sm text-gray-600 mb-1"><strong>SĐT:</strong> {form.SDT}</p>
            <p className="text-sm text-gray-600 mb-1"><strong>Hình thức TT:</strong> {form.HinhThucTT}</p>
            <p className="text-sm text-gray-600"><strong>Tổng thanh toán:</strong> <span className="text-red-600 font-bold">{Number(successInfo?.TongThanhToan || 0).toLocaleString('vi-VN')}đ</span></p>
          </div>
          <Link to="/" className="inline-block bg-cyan-600 text-white px-8 py-3 rounded-full font-bold hover:bg-cyan-700 transition">
            Về trang chủ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-extrabold text-gray-800 mb-8 flex items-center">
        <span className="w-1.5 h-8 bg-cyan-600 rounded-full mr-4 block"></span>
        {step === 'cart' ? 'Giỏ hàng của bạn' : '🧾 Thông tin đặt hàng'}
      </h1>

      {cart.length === 0 && step === 'cart' ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
          <img src="https://cdni.iconscout.com/illustration/premium/thumb/empty-cart-7359557-6024626.png" alt="Empty Cart" className="w-64 mx-auto mb-6 opacity-75" />
          <h2 className="text-2xl font-bold text-gray-700 mb-4">Không có sản phẩm nào trong giỏ</h2>
          <Link to="/special-offers" className="inline-block bg-cyan-600 text-white px-8 py-3 rounded-full font-bold hover:bg-cyan-700 transition">
            Tiếp tục mua sắm
          </Link>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8">
          {/* LEFT: Danh sách sản phẩm / Form đặt hàng */}
          <div className="lg:w-2/3">
            {step === 'cart' ? (
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
                              <button onClick={() => updateQuantity(item.product_code, item.quantity - 1)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition">
                                <Minus className="w-4 h-4 text-gray-600" />
                              </button>
                              <span className="font-semibold w-8 text-center">{item.quantity}</span>
                              <button onClick={() => updateQuantity(item.product_code, item.quantity + 1)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition">
                                <Plus className="w-4 h-4 text-gray-600" />
                              </button>
                            </div>
                          </td>
                          <td className="py-4 text-right font-bold text-cyan-600">
                            {(item.price * item.quantity).toLocaleString('vi-VN')}đ
                          </td>
                          <td className="py-4 text-right">
                            <button onClick={() => removeFromCart(item.product_code)} className="text-red-500 hover:text-red-700 p-2 bg-red-50 rounded-full transition">
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              /* Form đặt hàng */
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-4">Thông tin giao hàng</h2>
                {formError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 mb-4 text-sm">⚠️ {formError}</div>
                )}
                <form onSubmit={handlePlaceOrder}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Họ và tên <span className="text-red-500">*</span></label>
                      <input name="TenKH" className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-400" placeholder="Nguyễn Văn A" value={form.TenKH} onChange={handleFormChange} />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Số điện thoại <span className="text-red-500">*</span></label>
                      <input name="SDT" className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-400" placeholder="0901234567" value={form.SDT} onChange={handleFormChange} />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Địa chỉ giao hàng</label>
                      <input name="DiaChi" className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-400" placeholder="123 đường ABC, Quận X, TP.HCM" value={form.DiaChi} onChange={handleFormChange} />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Email (không bắt buộc)</label>
                      <input name="Email" type="email" className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-400" placeholder="email@example.com" value={form.Email} onChange={handleFormChange} />
                    </div>
                  </div>

                  {/* Chọn hình thức thanh toán */}
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Hình thức thanh toán</label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { value: 'Tiền mặt', label: 'Tiền mặt', icon: '💵', desc: 'Thanh toán khi nhận hàng' },
                        { value: 'MoMo', label: 'Ví MoMo', icon: '💜', desc: 'Thanh toán qua MoMo' },
                      ].map(opt => (
                        <label
                          key={opt.value}
                          className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition ${
                            form.HinhThucTT === opt.value
                              ? 'border-cyan-500 bg-cyan-50'
                              : 'border-gray-200 hover:border-cyan-300'
                          }`}
                        >
                          <input
                            type="radio"
                            name="HinhThucTT"
                            value={opt.value}
                            checked={form.HinhThucTT === opt.value}
                            onChange={handleFormChange}
                            className="hidden"
                          />
                          <span className="text-2xl">{opt.icon}</span>
                          <div>
                            <p className="font-bold text-gray-800 text-sm">{opt.label}</p>
                            <p className="text-xs text-gray-500">{opt.desc}</p>
                          </div>
                          {form.HinhThucTT === opt.value && (
                            <span className="ml-auto text-cyan-600 font-bold text-lg">✓</span>
                          )}
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Hướng dẫn MoMo */}
                  {form.HinhThucTT === 'MoMo' && (
                    <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-4 text-sm">
                      <p className="font-bold text-purple-800 mb-2">💜 Thanh toán qua MoMo</p>
                      <p className="text-purple-700">Sau khi đặt hàng, bạn sẽ nhận số tài khoản MoMo để chuyển khoản. Chúng tôi xử lý đơn sau khi xác nhận thanh toán.</p>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setStep('cart')}
                      className="flex-1 border-2 border-gray-300 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-50 transition"
                    >
                      ← Quay lại
                    </button>
                    <button
                      type="submit"
                      disabled={placing}
                      className="flex-[2] bg-cyan-600 text-white py-3 rounded-xl font-bold text-lg hover:bg-cyan-700 transition shadow-lg disabled:opacity-60"
                    >
                      {placing ? 'Đang xử lý...' : '🛒 Xác nhận đặt hàng'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* RIGHT: Tóm tắt đơn hàng */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
              <h3 className="text-xl font-bold text-gray-800 mb-6 border-b pb-4">Tóm tắt đơn hàng</h3>
              
              {/* Danh sách sản phẩm trong giỏ (tóm tắt) */}
              <div className="space-y-2 mb-4">
                {cart.map(item => (
                  <div key={item.product_code} className="flex justify-between text-sm text-gray-600">
                    <span className="line-clamp-1 flex-1 mr-2">{item.name} x{item.quantity}</span>
                    <span className="font-semibold whitespace-nowrap">{(item.price * item.quantity).toLocaleString('vi-VN')}đ</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between mb-4 text-gray-600 border-t pt-4">
                <span>Tạm tính:</span>
                <span className="font-semibold">{cartTotal.toLocaleString('vi-VN')}đ</span>
              </div>
              <div className="flex justify-between mb-2 text-gray-600">
                <span>VAT (10%):</span>
                <span className="font-semibold">{(cartTotal * 0.1).toLocaleString('vi-VN')}đ</span>
              </div>
              <div className="flex justify-between mb-6 text-gray-600">
                <span>Giao hàng:</span>
                <span className="text-green-500 font-semibold">Miễn phí</span>
              </div>
              <div className="flex justify-between items-center border-t pt-4 mb-6">
                <span className="text-xl font-bold text-gray-800">Tổng cộng:</span>
                <span className="text-2xl font-black text-cyan-600">{(cartTotal * 1.1).toLocaleString('vi-VN')}đ</span>
              </div>

              {step === 'cart' && (
                <button
                  onClick={handleCheckout}
                  className="w-full bg-cyan-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-cyan-700 transition shadow-lg hover:shadow-cyan-600/30"
                >
                  Tiến hành đặt hàng →
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
