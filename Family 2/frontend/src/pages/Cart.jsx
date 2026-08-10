import { useState, useEffect, useCallback } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Trash2, Plus, Minus, Tag, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import API from '../services/api';

// ===== Tính toán khuyến mãi áp dụng cho giỏ hàng =====
const computeDiscount = (cart, promotions, vipInfo) => {
  let discountLines = []; // [{label, amount, maKM, maSP}]

  // 1. KM theo sản phẩm (từ đợt KM đang hoạt động)
  if (promotions && promotions.length > 0) {
    for (const km of promotions) {
      if (!km.chiTiet || km.chiTiet.length === 0) continue;
      if (km.kieuKM === 'mua_tang') {
        // Mua X tặng Y → tính chiết khấu = số SP được tặng × đơn giá
        const soLuongMua = parseInt(km.soLuongMua) || 1;
        const soLuongTang = parseInt(km.soLuongTang) || 1;
        for (const ct of km.chiTiet) {
          const cartItem = cart.find(i => i.product_code === ct.MaSP);
          const muaToiThieu = parseInt(ct.MuaToiThieu) || soLuongMua;
          if (cartItem && cartItem.quantity >= muaToiThieu) {
            // Số lần đủ điều kiện (cứ mỗi soLuongMua SP mua thì được tặng soLuongTang SP)
            const soLanDuDK = Math.floor(cartItem.quantity / soLuongMua);
            const soSPTang = soLanDuDK * soLuongTang;
            const discountAmt = soSPTang * cartItem.price;
            discountLines.push({
              label: `🎁 ${km.TenCT}: Mua ${soLuongMua} Tặng ${soLuongTang} — ${ct.TenSP || ct.MaSP} (x${cartItem.quantity} → tặng ${soSPTang} SP)`,
              amount: discountAmt,
              maKM: km.MaKM,
              maSP: ct.MaSP,
              isMuaTang: true,
            });
          }
        }
      } else {
        // KM chiết khấu theo %/tiền
        for (const ct of km.chiTiet) {
          const cartItem = cart.find(i => i.product_code === ct.MaSP);
          if (cartItem && cartItem.quantity >= (parseInt(ct.MuaToiThieu) || 1)) {
            let discountAmt = 0;
            if (parseFloat(ct.GiamGiaPhanTram) > 0) {
              discountAmt = cartItem.price * cartItem.quantity * (parseFloat(ct.GiamGiaPhanTram) / 100);
              discountLines.push({
                label: `🏷️ ${km.TenCT}: Giảm ${ct.GiamGiaPhanTram}% — ${ct.TenSP || ct.MaSP} (x${cartItem.quantity})`,
                amount: discountAmt,
                maKM: km.MaKM,
                maSP: ct.MaSP,
              });
            } else if (parseFloat(ct.GiamGiaTien) > 0) {
              discountAmt = Math.min(parseFloat(ct.GiamGiaTien), cartItem.price * cartItem.quantity);
              discountLines.push({
                label: `🏷️ ${km.TenCT}: Giảm ${Number(ct.GiamGiaTien).toLocaleString('vi-VN')}đ — ${ct.TenSP || ct.MaSP}`,
                amount: discountAmt,
                maKM: km.MaKM,
                maSP: ct.MaSP,
              });
            }
          }
        }
      }
    }
  }

  // 2. KM VIP khách hàng thân thiết
  if (vipInfo && vipInfo.phanTram > 0) {
    const cartSubtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
    const vipDiscount = cartSubtotal * (vipInfo.phanTram / 100);
    discountLines.push({
      label: `${vipInfo.label}: Ưu đãi khách hàng thân thiết -${vipInfo.phanTram}%`,
      amount: vipDiscount,
      maKM: null,
      maSP: null,
      isVip: true,
    });
  }

  const totalDiscount = discountLines.reduce((s, d) => s + (d.amount || 0), 0);
  // Lấy MaKM, MaSP áp dụng đầu tiên (ưu tiên KM sản phẩm)
  const mainKM = discountLines.find(d => d.maKM && !d.isVip);
  return {
    lines: discountLines,
    total: totalDiscount,
    MaKM_ApDung: mainKM?.maKM || null,
    MaSP_ApDung: mainKM?.maSP || null,
  };
};

const Cart = () => {
  const { cart, updateQuantity, removeFromCart, cartTotal, clearCart } = useCart();
  const { currentUser, openAuthModal } = useAuth();

  const [step, setStep] = useState('cart');
  const [successInfo, setSuccessInfo] = useState(null);
  const [form, setForm] = useState({ TenKH: '', SDT: '', DiaChi: '', Email: '', HinhThucTT: 'Tiền mặt' });
  const [formError, setFormError] = useState('');
  const [placing, setPlacing] = useState(false);
  const [loadingPhone, setLoadingPhone] = useState(false);

  // KM & VIP state
  const [promotions, setPromotions] = useState([]);
  const [vipInfo, setVipInfo] = useState(null);
  const [discountResult, setDiscountResult] = useState({ lines: [], total: 0, MaKM_ApDung: null, MaSP_ApDung: null });

  const handleFormChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  // Tự động điền nếu đã login
  useEffect(() => {
    if (currentUser) {
      setForm(prev => ({ ...prev, TenKH: currentUser.name || prev.TenKH, SDT: currentUser.phone || prev.SDT, Email: currentUser.email || prev.Email }));
    }
  }, [currentUser]);

  // Fetch promotions đang hoạt động
  useEffect(() => {
    API.get('/promotions').then(r => setPromotions(r.data || [])).catch(() => {});
  }, []);

  // Tính lại discount khi cart / promotions / vipInfo thay đổi
  useEffect(() => {
    setDiscountResult(computeDiscount(cart, promotions, vipInfo));
  }, [cart, promotions, vipInfo]);

  // Auto-fill khi nhập xong SĐT + check VIP
  const handlePhoneBlur = async () => {
    if (form.SDT && form.SDT.length >= 10) {
      setLoadingPhone(true);
      try {
        const res = await API.get(`/customers/lookup/${form.SDT}`);
        if (res.data) {
          setForm(prev => ({ ...prev, TenKH: res.data.TenKH || prev.TenKH, DiaChi: res.data.DiaChi || prev.DiaChi, Email: res.data.Email || prev.Email }));
        }
      } catch {}
      try {
        const vipRes = await API.get(`/customers/${form.SDT}/vip`);
        setVipInfo(vipRes.data);
      } catch { setVipInfo(null); }
      setLoadingPhone(false);
    }
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;
    if (!currentUser) { openAuthModal('login'); return; }
    setStep('checkout');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!form.TenKH || !form.SDT || !form.DiaChi) {
      setFormError('Vui lòng điền đầy đủ Họ tên, Số điện thoại và Địa chỉ giao hàng bắt buộc');
      return;
    }
    setFormError('');
    setPlacing(true);
    try {
      const items = cart.map(item => ({ MaSP: item.product_code, SoLuong: item.quantity }));
      const res = await API.post('/orders', {
        TenKH: form.TenKH, SDT: form.SDT, DiaChi: form.DiaChi, Email: form.Email,
        HinhThucTT: form.HinhThucTT,
        items,
        MaKM_ApDung: discountResult.MaKM_ApDung,
        MaSP_ApDung: discountResult.MaSP_ApDung,
        discountAmount: discountResult.total,
      });
      clearCart();
      setSuccessInfo(res.data);
      if (form.HinhThucTT === 'MoMo') setStep('momo');
      else setStep('success');
    } catch (err) {
      setFormError(err.response?.data?.message || 'Lỗi đặt hàng. Vui lòng thử lại.');
    } finally { setPlacing(false); }
  };

  const vatAmount = cartTotal * 0.1;
  const finalTotal = cartTotal + vatAmount - discountResult.total;

  // --- MoMo page ---
  if (step === 'momo') {
    return (
      <div className="container mx-auto px-4 py-16 max-w-xl text-center">
        <div className="bg-white rounded-3xl shadow-lg p-10 border border-gray-100 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-3 bg-pink-600"></div>
          <img src="https://upload.wikimedia.org/wikipedia/vi/f/fe/MoMo_Logo.png" alt="MoMo" className="h-16 mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Thanh toán qua MoMo</h1>
          <p className="text-gray-500 mb-6">Mã đơn hàng: <strong className="text-pink-600">{successInfo?.MaDon}</strong></p>
          <div className="bg-gray-50 rounded-2xl p-6 mb-8 border border-gray-100 inline-block">
            <img src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=MOMO_${successInfo?.MaDon}_${successInfo?.TongThanhToan}`} alt="QR Code" className="w-48 h-48 mx-auto shadow-sm rounded-lg" />
            <p className="mt-4 font-bold text-xl text-gray-800">{Number(successInfo?.TongThanhToan || 0).toLocaleString('vi-VN')}đ</p>
          </div>
          <p className="text-sm text-gray-500 mb-6 px-4">Quét mã QR bằng ứng dụng MoMo. Bấm "Hoàn tất" bên dưới sau khi thanh toán thành công.</p>
          <button onClick={() => setStep('success')} className="w-full bg-pink-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-pink-700 transition">Đã thanh toán thành công</button>
        </div>
      </div>
    );
  }

  // --- Success page ---
  if (step === 'success') {
    return (
      <div className="container mx-auto px-4 py-16 max-w-xl text-center">
        <div className="bg-white rounded-3xl shadow-lg p-10 border border-gray-100">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-3xl font-extrabold text-gray-800 mb-2">Đặt hàng thành công!</h1>
          <p className="text-gray-500 mb-6">Cảm ơn bạn {form.TenKH} đã đồng hành cùng FamilyMart</p>
          <div className="bg-cyan-50 rounded-2xl p-6 text-left mb-6 shadow-inner">
            <p className="mb-2"><strong>Mã đơn hàng:</strong> <span className="text-cyan-700 font-bold">{successInfo?.MaDon}</span></p>
            <p className="mb-2"><strong>Họ tên:</strong> {form.TenKH}</p>
            <p className="mb-2"><strong>SĐT:</strong> {form.SDT}</p>
            <p className="mb-2"><strong>Địa chỉ giao:</strong> {form.DiaChi}</p>
            <p className="mb-2"><strong>Hình thức TT:</strong> {form.HinhThucTT}</p>
            {Number(successInfo?.TongChietKhau) > 0 && (
              <p className="mb-2 text-green-700 font-semibold">🏷️ Đã giảm: {Number(successInfo.TongChietKhau).toLocaleString('vi-VN')}đ</p>
            )}
            <hr className="my-3 border-cyan-200" />
            <p className="text-lg"><strong>Tổng thanh toán:</strong> <span className="text-red-600 font-bold text-xl">{Number(successInfo?.TongThanhToan || 0).toLocaleString('vi-VN')}đ</span></p>
          </div>
          <Link to="/" className="inline-block bg-cyan-600 text-white px-8 py-3 rounded-full font-bold hover:bg-cyan-700 transition w-full">Về trang chủ</Link>
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
          <Link to="/special-offers" className="inline-block bg-cyan-600 text-white px-8 py-3 rounded-full font-bold hover:bg-cyan-700 transition">Tiếp tục mua sắm</Link>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8">
          {/* LEFT */}
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
                        <tr key={item.product_code} className="border-b last:border-0 hover:bg-gray-50 transition">
                          <td className="py-4">
                            <div className="flex items-center space-x-4">
                              <img src={item.image || 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=100'} alt={item.name} className="w-20 h-20 object-cover rounded-lg bg-white border" />
                              <span className="font-semibold text-gray-800 line-clamp-2 md:w-48">{item.name}</span>
                            </div>
                          </td>
                          <td className="py-4 text-center font-medium text-gray-600">{parseFloat(item.price).toLocaleString('vi-VN')}đ</td>
                          <td className="py-4">
                            <div className="flex items-center justify-center space-x-2">
                              <button onClick={() => updateQuantity(item.product_code, item.quantity - 1)} className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition"><Minus className="w-4 h-4 text-gray-700" /></button>
                              <span className="font-bold w-8 text-center text-lg">{item.quantity}</span>
                              <button onClick={() => updateQuantity(item.product_code, item.quantity + 1)} className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition"><Plus className="w-4 h-4 text-gray-700" /></button>
                            </div>
                          </td>
                          <td className="py-4 text-right font-bold text-cyan-600">{(item.price * item.quantity).toLocaleString('vi-VN')}đ</td>
                          <td className="py-4 text-right">
                            <button onClick={() => removeFromCart(item.product_code)} className="text-red-500 hover:text-white hover:bg-red-500 p-2 rounded-full transition bg-red-50"><Trash2 className="w-5 h-5" /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Khuyến mãi áp dụng */}
                {discountResult.lines.length > 0 && (
                  <div className="border-t bg-gradient-to-r from-orange-50 to-yellow-50 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Tag className="w-5 h-5 text-orange-500" />
                      <span className="font-bold text-orange-700 text-sm">Khuyến mãi đang áp dụng</span>
                    </div>
                    <div className="space-y-2">
                      {discountResult.lines.map((d, i) => (
                        <div key={i} className="flex justify-between items-center text-sm bg-white rounded-lg px-3 py-2 shadow-sm border border-orange-100">
                          <span className="text-gray-700 flex-1">{d.label}</span>
                          {d.amount > 0 && <span className="text-red-600 font-bold ml-4 whitespace-nowrap">-{d.amount.toLocaleString('vi-VN')}đ</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* VIP badge */}
                {vipInfo && vipInfo.phanTram > 0 && (
                  <div className="border-t bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-3">
                    <div className="flex items-center gap-2 text-sm text-purple-700">
                      <Star className="w-4 h-4 fill-yellow-400 stroke-yellow-400" />
                      <span><strong>Khách hàng {vipInfo.label}</strong> — {vipInfo.soDon} đơn đã mua — Ưu đãi -{vipInfo.phanTram}% toàn đơn</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Form đặt hàng */
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between border-b pb-4 mb-6">
                  <h2 className="text-xl font-bold text-gray-800">Thông tin giao hàng</h2>
                  {loadingPhone && <span className="text-xs text-cyan-600 font-bold animate-pulse">⏳ Đang tìm thông tin...</span>}
                </div>
                {formError && (
                  <div className="bg-red-50 border-l-4 border-red-500 text-red-700 rounded p-3 mb-4 font-medium shadow-sm flex items-center">
                    <span className="text-xl mr-2">⚠️</span> {formError}
                  </div>
                )}
                <form onSubmit={handlePlaceOrder}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="md:col-span-1">
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Số điện thoại <span className="text-red-500">*</span> <span className="text-xs font-normal text-gray-400 italic">(Nhập để Tự điền + check VIP)</span></label>
                      <input name="SDT" onBlur={handlePhoneBlur} className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-400 transition" placeholder="VD: 0901234567" value={form.SDT} onChange={handleFormChange} />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Họ và tên <span className="text-red-500">*</span></label>
                      <input name="TenKH" className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-400 transition bg-gray-50 focus:bg-white" placeholder="VD: Nguyễn Văn A" value={form.TenKH} onChange={handleFormChange} />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Địa chỉ giao hàng <span className="text-red-500">*</span></label>
                      <input name="DiaChi" className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-400 transition bg-gray-50 focus:bg-white" placeholder="Số nhà, Đường, Phường, Quận" value={form.DiaChi} onChange={handleFormChange} />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Email <span className="text-xs font-normal text-gray-400">(Không bắt buộc)</span></label>
                      <input name="Email" type="email" className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-400 transition" placeholder="email@example.com" value={form.Email} onChange={handleFormChange} />
                    </div>
                  </div>

                  {/* Hình thức thanh toán */}
                  <div className="mb-6 mt-8">
                    <label className="block text-base font-bold text-gray-800 mb-3">🏷️ Chọn Hình thức thanh toán</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        { value: 'Tiền mặt', label: 'Thanh toán Tiền mặt', icon: '💵', desc: 'Giao hàng nhận tiền (COD)' },
                        { value: 'MoMo', label: 'Ví MoMo', icon: '💜', desc: 'Quét mã QR nhanh chóng' },
                      ].map(opt => (
                        <label key={opt.value} className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition transform hover:-translate-y-1 ${form.HinhThucTT === opt.value ? 'border-cyan-500 bg-cyan-50 shadow-md' : 'border-gray-200 hover:border-cyan-300 bg-white shadow-sm'}`}>
                          <input type="radio" name="HinhThucTT" value={opt.value} checked={form.HinhThucTT === opt.value} onChange={handleFormChange} className="hidden" />
                          <span className="text-3xl filter drop-shadow-sm">{opt.icon}</span>
                          <div>
                            <p className="font-bold text-gray-800 text-sm md:text-base">{opt.label}</p>
                            <p className="text-xs text-gray-500">{opt.desc}</p>
                          </div>
                          {form.HinhThucTT === opt.value && <span className="ml-auto bg-cyan-600 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold text-sm shadow">✓</span>}
                        </label>
                      ))}
                    </div>
                  </div>
                  {form.HinhThucTT === 'MoMo' && (
                    <div className="bg-pink-50 border border-pink-200 rounded-xl p-4 mb-6 text-sm flex items-start">
                      <span className="text-2xl mr-3">📱</span>
                      <div>
                        <p className="font-extrabold text-pink-700 mb-1">Mở ứng dụng MoMo để sẵn sàng</p>
                        <p className="text-pink-600 font-medium">Bấm Đặt hàng xong hệ thống sẽ hiện Mã QR MoMo để bạn quét thanh toán.</p>
                      </div>
                    </div>
                  )}
                  <div className="flex gap-4 mt-6">
                    <button type="button" onClick={() => setStep('cart')} className="w-1/3 border-2 border-gray-300 text-gray-700 py-4 rounded-xl font-bold hover:bg-gray-100 transition shadow-sm">← Sửa giỏ</button>
                    <button type="submit" disabled={placing} className="w-2/3 bg-cyan-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-cyan-700 transition shadow-lg disabled:opacity-50 flex justify-center items-center gap-2">
                      {placing ? <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div> : <>🛒 Tiến Hành Đặt Hàng</>}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* RIGHT: Tóm tắt */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
              <h3 className="text-xl font-bold text-gray-800 mb-6 border-b pb-4">Tóm tắt đơn hàng</h3>
              <div className="space-y-3 mb-6 max-h-60 overflow-y-auto pr-2">
                {cart.map(item => (
                  <div key={item.product_code} className="flex justify-between items-center text-sm text-gray-600 bg-gray-50 p-2 rounded-lg">
                    <span className="line-clamp-2 flex-1 mr-2 font-medium">{item.name} <span className="font-bold text-cyan-700 ml-1">x{item.quantity}</span></span>
                    <span className="font-bold text-gray-800">{(item.price * item.quantity).toLocaleString('vi-VN')}đ</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between mb-3 text-gray-600">
                <span>Tạm tính:</span>
                <span className="font-medium">{cartTotal.toLocaleString('vi-VN')}đ</span>
              </div>
              <div className="flex justify-between mb-3 text-gray-600">
                <span>Thuế VAT (10%):</span>
                <span className="font-medium">{vatAmount.toLocaleString('vi-VN')}đ</span>
              </div>

              {/* Dòng khuyến mãi */}
              {discountResult.lines.map((d, i) => d.amount > 0 && (
                <div key={i} className="flex justify-between mb-2 text-sm">
                  <span className="text-orange-600 flex-1 mr-2 leading-tight">{d.label.length > 40 ? d.label.slice(0,40) + '…' : d.label}</span>
                  <span className="text-red-600 font-bold whitespace-nowrap">-{d.amount.toLocaleString('vi-VN')}đ</span>
                </div>
              ))}

              <div className="flex justify-between mb-6 text-gray-600">
                <span>Giao hàng:</span>
                <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded font-bold text-xs uppercase shadow-sm border border-green-200">Miễn phí</span>
              </div>

              {discountResult.total > 0 && (
                <div className="flex justify-between mb-4 bg-red-50 rounded-xl px-3 py-2 border border-red-100">
                  <span className="text-red-700 font-semibold">🏷️ Tổng giảm giá:</span>
                  <span className="text-red-600 font-extrabold">-{discountResult.total.toLocaleString('vi-VN')}đ</span>
                </div>
              )}

              <div className="flex justify-between items-center border-t border-dashed border-gray-300 pt-4 mb-6">
                <span className="text-lg font-bold text-gray-800">Tổng cộng:</span>
                <span className="text-3xl font-black text-cyan-600">{Math.max(0, finalTotal).toLocaleString('vi-VN')}đ</span>
              </div>

              {/* VIP badge in summary */}
              {vipInfo && vipInfo.level !== 'thuong' && (
                <div className="mb-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-3 border border-purple-100">
                  <div className="flex items-center gap-2 text-sm text-purple-700">
                    <Star className="w-4 h-4 fill-yellow-400 stroke-yellow-400" />
                    <div>
                      <div className="font-bold">{vipInfo.label} — Ưu đãi -{vipInfo.phanTram}%</div>
                      <div className="text-xs text-gray-500">{vipInfo.soDon} đơn / {Number(vipInfo.tongChiTieu).toLocaleString('vi-VN')}đ đã chi tiêu</div>
                    </div>
                  </div>
                </div>
              )}

              {step === 'cart' && (
                <button onClick={handleCheckout} className="w-full bg-cyan-600 text-white py-4 rounded-xl font-extrabold text-lg hover:bg-cyan-700 transition shadow-[0_8px_20px_-6px_rgba(8,145,178,0.5)] transform hover:-translate-y-1">
                  🚀 Tới trang Thanh Toán
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
