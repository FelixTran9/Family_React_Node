import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import adminApi from "../../../services/adminApi";

const NhapHangDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    adminApi.get(`/nhap-hang/${id}`)
      .then(r => setData(r.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm("Xóa phiếu nhập này? Tồn kho sẽ được hoàn lại.")) return;
    setDeleting(true);
    try {
      await adminApi.delete(`/nhap-hang/${id}`);
      navigate("/admin/nhap-hang");
    } catch { alert("Lỗi xóa phiếu nhập"); setDeleting(false); }
  };

  const fmtMoney = (n) => Number(n || 0).toLocaleString("vi-VN") + "₫";
  const fmtDate = (d) => d ? new Date(d).toLocaleString("vi-VN", { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' }) : "—";

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 bg-slate-50">
      <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-600 rounded-full animate-spin" />
      <span className="text-slate-500 font-medium animate-pulse">Đang tải dữ liệu phiếu nhập...</span>
    </div>
  );

  if (!data) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] bg-slate-50">
      <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-4">
        <span className="text-4xl">⚠️</span>
      </div>
      <h2 className="text-xl font-bold text-slate-800 mb-2">Không tìm thấy phiếu nhập</h2>
      <p className="text-slate-500 mb-6">Mã phiếu không tồn tại hoặc đã bị xóa khỏi hệ thống.</p>
      <Link to="/admin/nhap-hang" className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all">
        ← Quay lại danh sách
      </Link>
    </div>
  );

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-8 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 flex items-center gap-3">
            <Link to="/admin/nhap-hang" className="text-slate-400 hover:text-blue-600 transition-colors mr-2">←</Link>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-600">
              Chi Tiết Phiếu Nhập
            </span>
            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-xl font-mono border border-blue-200 ml-2 shadow-sm relative -top-1">
              {data.MaNH}
            </span>
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-2 ml-12">
            Thời điểm nhập: <span className="text-slate-700 font-bold">{fmtDate(data.NgayNhap)}</span>
          </p>
        </div>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="px-6 py-3 rounded-2xl bg-white border border-red-200 text-red-600 hover:bg-red-600 hover:text-white hover:border-red-600 font-bold text-sm transition-all shadow-sm hover:shadow-lg disabled:opacity-50 disabled:grayscale"
        >
          {deleting ? "Đang xử lý..." : "🗑️ Hủy & Xóa Phiếu"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        {/* Info Sidebar */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/40 border border-slate-100 p-6">
             <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Thông Tin Phiếu</h2>
             
             <div className="space-y-6">
               <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Nhà Cung Cấp</p>
                  <p className="text-base font-bold text-slate-800 flex items-center gap-2">
                    <span className="text-blue-500">🏢</span> {data.TenNCC || "Không có dữ liệu"}
                  </p>
               </div>
               <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Người Lập Phiếu</p>
                  <p className="text-base font-bold text-slate-800 flex items-center gap-2">
                    <span className="text-emerald-500">🧑‍💼</span> {data.TenNV || "Không có dữ liệu"}
                  </p>
               </div>
               <div className="pt-4 border-t border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Ghi Chú</p>
                  {data.GhiChu ? (
                    <div className="bg-amber-50 border border-amber-100 text-amber-800 px-4 py-3 rounded-2xl text-sm leading-relaxed">
                      {data.GhiChu}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400 italic">Không có ghi chú.</p>
                  )}
               </div>
             </div>
          </div>

          {/* Abstract summary block */}
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl shadow-xl shadow-blue-900/20 p-6 text-white relative overflow-hidden">
             <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 blur-2xl rounded-full"></div>
             <p className="text-xs font-bold text-blue-200 uppercase tracking-wider mb-2 relative z-10">Tổng Thanh Toán</p>
             <p className="text-4xl font-black mb-1 relative z-10">{fmtMoney(data.TongTien)}</p>
             <p className="text-sm text-blue-200 font-medium relative z-10">{data.chiTiet?.length || 0} mặt hàng sản phẩm</p>
          </div>
        </div>

        {/* Table List */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-emerald-600"></div>
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white">
              <h2 className="text-lg font-bold text-slate-800">Chi Tiết Hạch Toán</h2>
            </div>
            
            <div className="overflow-x-auto p-4 sm:p-6">
              <div className="space-y-3">
                {(data.chiTiet || []).map((ct, idx) => (
                  <div key={ct.MaCTNH} className="flex flex-col sm:flex-row items-center border border-slate-100 bg-slate-50 rounded-2xl p-4 gap-4 hover:border-emerald-200 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-400 shadow-sm shrink-0">
                      {idx + 1}
                    </div>
                    
                    <div className="flex-1 text-center sm:text-left min-w-0">
                      <p className="text-sm font-bold text-slate-800 truncate">{ct.TenSP || ct.MaSP}</p>
                      <p className="text-[11px] font-semibold text-slate-400 uppercase mt-0.5">Mã SP: {ct.MaSP} • ĐVT: {ct.DonViTinh || "—"}</p>
                    </div>

                    <div className="flex items-center gap-6 text-sm">
                      <div className="text-center sm:text-right">
                         <p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">SL / Đơn giá</p>
                         <p className="font-bold text-slate-700">
                           {ct.SoLuong} <span className="text-slate-300 font-normal mx-1">x</span> {fmtMoney(ct.DonGiaNhap)}
                         </p>
                      </div>
                      <div className="text-right pl-4 border-l border-slate-200">
                         <p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">Thành tiền</p>
                         <p className="font-bold text-emerald-600 text-base">{fmtMoney(ct.SoLuong * ct.DonGiaNhap)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NhapHangDetail;
