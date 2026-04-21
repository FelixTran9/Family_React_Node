import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import adminApi from "../../../services/adminApi";

const NhapHangCreate = () => {
  const navigate = useNavigate();
  const [suppliers, setSuppliers] = useState([]);
  const [staffs, setStaffs] = useState([]);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ MaNCC: "", MaNV: "", GhiChu: "" });
  const [chiTiet, setChiTiet] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    adminApi.get("/suppliers?limit=200").then(r => setSuppliers(r.data.data || []));
    adminApi.get("/staff?limit=200").then(r => setStaffs(r.data.data?.filter(s => s.TrangThai === "active") || []));
    adminApi.get("/products?limit=500").then(r => setProducts(r.data.data || []));
  }, []);

  const addLine = () => setChiTiet(prev => [...prev, { MaSP: "", SoLuong: 1, DonGiaNhap: 0 }]);
  const removeLine = (idx) => setChiTiet(prev => prev.filter((_, i) => i !== idx));

  const updateLine = (idx, field, value) => {
    setChiTiet(prev => prev.map((ct, i) => {
      if (i !== idx) return ct;
      const updated = { ...ct, [field]: value };
      if (field === "MaSP") {
        const sp = products.find(p => p.MaSP === value);
        if (sp) updated.DonGiaNhap = sp.GiaVon || 0;
      }
      return updated;
    }));
  };

  const tongTien = chiTiet.reduce((s, ct) => s + (Number(ct.SoLuong) || 0) * (Number(ct.DonGiaNhap) || 0), 0);
  const fmtMoney = (n) => Number(n || 0).toLocaleString("vi-VN") + "₫";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.MaNCC || !form.MaNV) { setError("Vui lòng chọn nhà cung cấp và nhân viên"); return; }
    if (chiTiet.length === 0) { setError("Vui lòng thêm ít nhất 1 sản phẩm"); return; }
    if (chiTiet.some(ct => !ct.MaSP || ct.SoLuong <= 0)) { setError("Vui lòng điền đầy đủ thông tin chi tiết sản phẩm"); return; }
    setSaving(true);
    try {
      await adminApi.post("/nhap-hang", { ...form, chiTiet });
      navigate("/admin/nhap-hang");
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi tạo phiếu");
    } finally { setSaving(false); }
  };

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-8 bg-slate-50 min-h-screen">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
          <Link to="/admin/nhap-hang" className="text-slate-400 hover:text-blue-600 transition-colors mr-2">←</Link>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-600">
            Tạo Phiếu Nhập Hàng
          </span>
        </h1>
        <p className="text-sm font-medium text-slate-500 mt-2 ml-10">
          Nhập mới sản phẩm từ nhà cung cấp vào hệ thống. Tồn kho sẽ tự động cập nhật.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-xl px-6 py-4 shadow-sm animate-fade-in flex items-center gap-3">
          <span className="text-xl">⚠️</span>
          <span className="font-medium">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-8 items-start">
        <div className="w-full lg:w-2/3 space-y-8">
          {/* Danh sách sản phẩm */}
          <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Sản Phẩm Nhập ({chiTiet.length})</h2>
                <p className="text-xs font-medium text-slate-400 mt-1 uppercase tracking-wider">Chi tiết phiếu</p>
              </div>
              <button type="button" onClick={addLine}
                className="inline-flex items-center gap-2 bg-emerald-50 hover:bg-emerald-500 text-emerald-600 hover:text-white px-5 py-2.5 rounded-2xl text-sm font-bold transition-all shadow-sm">
                + Thêm SP
              </button>
            </div>

            {chiTiet.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-slate-400 bg-slate-50/50">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4 border-4 border-white shadow-sm">
                  <span className="text-3xl opacity-60">🛒</span>
                </div>
                <p className="font-semibold text-slate-600">Danh sách trống</p>
                <p className="text-sm mt-1">Bấm nút thêm sản phẩm ở góc phải</p>
              </div>
            ) : (
              <div className="overflow-x-auto p-4 sm:p-8">
                <div className="space-y-4">
                  {chiTiet.map((ct, idx) => {
                    const sp = products.find(p => p.MaSP === ct.MaSP);
                    const thanh = (Number(ct.SoLuong) || 0) * (Number(ct.DonGiaNhap) || 0);
                    return (
                      <div key={idx} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-slate-50 border border-slate-200 rounded-2xl relative group hover:border-blue-300 transition-colors">
                        <span className="absolute -left-3 top-1/2 -translate-y-1/2 bg-slate-200 text-slate-500 text-[10px] sm:text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full shadow-sm">
                          {idx + 1}
                        </span>
                        
                        <div className="flex-1 w-full min-w-[200px]">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Mặt hàng</label>
                          <select
                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all appearance-none"
                            value={ct.MaSP}
                            onChange={e => updateLine(idx, "MaSP", e.target.value)}
                          >
                            <option value="" disabled>-- Chọn --</option>
                            {products.map(p => <option key={p.MaSP} value={p.MaSP}>{p.TenSP}</option>)}
                          </select>
                          {sp && <p className="text-[11px] font-medium text-slate-400 mt-1.5 ml-1">Kho hiện tại: <span className="text-blue-600 font-bold">{sp.TonKho}</span> {sp.DonViTinh}</p>}
                        </div>

                        <div className="w-full sm:w-28">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Số lượng</label>
                          <input type="number" min="1"
                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-center text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                            value={ct.SoLuong}
                            onChange={e => updateLine(idx, "SoLuong", Number(e.target.value))}
                          />
                        </div>

                        <div className="w-full sm:w-36">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Đơn giá nhập</label>
                          <input type="number" min="0" step="1000"
                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                            value={ct.DonGiaNhap}
                            onChange={e => updateLine(idx, "DonGiaNhap", Number(e.target.value))}
                          />
                        </div>

                        <div className="w-full sm:w-36 text-right sm:mt-5 bg-white p-2.5 rounded-xl border border-emerald-100 flex items-center justify-between sm:justify-end gap-2">
                          <span className="sm:hidden text-xs font-bold text-slate-400">Thành tiền:</span>
                          <span className="font-black text-emerald-600 truncate">{fmtMoney(thanh)}</span>
                        </div>

                        <button type="button" onClick={() => removeLine(idx)}
                          className="absolute -right-2 -top-2 w-7 h-7 bg-white border border-slate-200 rounded-full text-red-500 hover:bg-red-500 hover:text-white hover:border-red-500 flex items-center justify-center font-bold text-sm shadow-sm transition-all sm:static sm:w-10 sm:h-10 sm:rounded-xl sm:mt-5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100">
                          ✕
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Thông tin phiếu & Thanh toán (Sidebar sticky) */}
        <div className="w-full lg:w-1/3 flex flex-col gap-6 sticky top-8">
          <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/40 border border-slate-100 p-8">
            <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <span className="text-blue-500">📄</span> Thông tin phiếu
            </h2>
            <div className="space-y-5">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-2">Nhà cung cấp <span className="text-red-500">*</span></label>
                <select
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all appearance-none"
                  value={form.MaNCC}
                  onChange={e => setForm(p => ({ ...p, MaNCC: e.target.value }))}
                >
                  <option value="" disabled>-- Chọn nhà CC --</option>
                  {suppliers.map(s => <option key={s.MaNCC} value={s.MaNCC}>{s.TenNCC}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-2">Người tiếp nhận <span className="text-red-500">*</span></label>
                <select
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all appearance-none"
                  value={form.MaNV}
                  onChange={e => setForm(p => ({ ...p, MaNV: e.target.value }))}
                >
                  <option value="" disabled>-- Chọn NV --</option>
                  {staffs.map(s => <option key={s.MaNV} value={s.MaNV}>{s.TenNV}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-2">Ghi chú thêm</label>
                <textarea
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all resize-none min-h-[100px]"
                  placeholder="Diễn giải, mã vận đơn..."
                  value={form.GhiChu}
                  onChange={e => setForm(p => ({ ...p, GhiChu: e.target.value }))}
                />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl shadow-xl p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 blur-3xl rounded-full"></div>
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Tổng Thanh Toán</h3>
            <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-emerald-300 mb-8 dropdown-shadow">
              {fmtMoney(tongTien)}
            </div>
            
            <div className="flex flex-col gap-3 relative z-10">
              <button type="submit" disabled={saving || chiTiet.length === 0}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 font-bold text-sm shadow-lg shadow-blue-900/50 transition-all active:scale-[0.98] disabled:opacity-50 disabled:grayscale">
                {saving ? (
                   <span className="flex items-center justify-center gap-2">
                     <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> Đang xử lý...
                   </span>
                ) : "💾 Lưu & Xác Nhận Phiếu"}
              </button>
              <button type="button" onClick={() => navigate("/admin/nhap-hang")}
                className="w-full py-4 rounded-2xl bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold text-sm transition-all">
                Hủy bỏ
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default NhapHangCreate;
