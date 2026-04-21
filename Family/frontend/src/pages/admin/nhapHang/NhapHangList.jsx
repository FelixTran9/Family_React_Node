import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import adminApi from "../../../services/adminApi";

const NhapHangList = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const limit = 15;
  const totalPages = Math.ceil(total / limit);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ q, page, limit, from, to });
      const res = await adminApi.get(`/nhap-hang?${params}`);
      setData(res.data.data || []);
      setTotal(res.data.total || 0);
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [page, q, from, to]);

  const handleDelete = async (id) => {
    if (!window.confirm("Xóa phiếu nhập hàng này? Tồn kho sẽ được hoàn lại.")) return;
    setDeleting(id);
    try {
      await adminApi.delete(`/nhap-hang/${id}`);
      fetchData();
    } catch { alert("Lỗi xóa phiếu nhập"); }
    finally { setDeleting(null); }
  };

  const fmtMoney = (n) => Number(n || 0).toLocaleString("vi-VN") + "₫";
  const fmtDate = (d) => d ? new Date(d).toLocaleDateString("vi-VN") : "—";
  
  const totalMoney = data.reduce((sum, item) => sum + (Number(item.TongTien) || 0), 0);

  return (
    <div className="p-6 md:p-8 space-y-8 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
            <span className="text-4xl drop-shadow-md">📦</span> 
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-600">
              Quản lý Nhập hàng
            </span>
          </h1>
          <p className="text-slate-500 font-medium text-sm mt-2 ml-1">
            Theo dõi và kiểm soát toàn bộ phiếu nhập từ nhà phân phối
          </p>
        </div>
        <Link
          to="/admin/nhap-hang/create"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-2xl font-bold text-sm transition-all shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5"
        >
          <span className="text-lg leading-none">+</span> Tạo phiếu nhập
        </Link>
      </div>

      {/* Summary Stats (Optional but makes UI dynamic) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-50 rounded-full blur-2xl group-hover:bg-blue-100 transition-colors"></div>
          <div className="relative">
            <p className="text-slate-500 font-semibold text-sm mb-1 uppercase tracking-wider">Tổng phiếu trang này</p>
            <p className="text-4xl font-black text-slate-800">{data.length}</p>
          </div>
        </div>
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-50 rounded-full blur-2xl group-hover:bg-emerald-100 transition-colors"></div>
          <div className="relative">
            <p className="text-slate-500 font-semibold text-sm mb-1 uppercase tracking-wider">Tổng giá trị trang này</p>
            <p className="text-3xl font-black text-emerald-600">{fmtMoney(totalMoney)}</p>
          </div>
        </div>
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-50 rounded-full blur-2xl group-hover:bg-indigo-100 transition-colors"></div>
          <div className="relative">
            <p className="text-slate-500 font-semibold text-sm mb-1 uppercase tracking-wider">Tổng số phiếu hệ thống</p>
            <p className="text-4xl font-black text-indigo-600">{total}</p>
          </div>
        </div>
      </div>

      {/* Filters Card */}
      <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/40 border border-slate-100 p-6 relative overflow-hidden">
        <div className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-blue-500 to-indigo-500"></div>
        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-widest mb-4">Bộ Lọc Tìm Kiếm</h3>
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <span className="text-slate-400">🔍</span>
            </div>
            <input
              type="text"
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white transition-all font-medium text-slate-700 placeholder-slate-400"
              placeholder="Tìm mã phiếu, nhà cung cấp, nhân viên..."
              value={q}
              onChange={(e) => { setQ(e.target.value); setPage(1); }}
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs font-bold text-slate-400 uppercase">Từ</span>
              <input type="date" 
                className="w-full sm:w-auto px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-600 font-medium transition-all" 
                value={from} onChange={(e) => { setFrom(e.target.value); setPage(1); }} />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs font-bold text-slate-400 uppercase">Đến</span>
              <input type="date" 
                className="w-full sm:w-auto px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-600 font-medium transition-all" 
                value={to} onChange={(e) => { setTo(e.target.value); setPage(1); }} />
            </div>
            <button onClick={() => { setQ(""); setFrom(""); setTo(""); setPage(1); }}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl border-2 border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-100 hover:border-slate-300 transition-all active:scale-95">
              Xóa Lọc
            </button>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 text-blue-500 gap-4">
            <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
            <p className="font-medium animate-pulse text-slate-500">Đang đồng bộ dữ liệu...</p>
          </div>
        ) : data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 px-4 text-center">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
              <span className="text-5xl opacity-50 grayscale">📦</span>
            </div>
            <h3 className="text-xl font-bold text-slate-700 mb-2">Chưa có dữ liệu nhập hàng</h3>
            <p className="text-slate-500 max-w-sm mx-auto">Thử thay đổi bộ lọc hoặc thêm mới phiếu nhập để bắt đầu theo dõi kho hàng của bạn.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Mã Phiếu</th>
                  <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Ngày Nhập</th>
                  <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Nhà Cung Cấp</th>
                  <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Nhân Viên</th>
                  <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Số Dòng</th>
                  <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Tổng Tiền</th>
                  <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Hành Động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {data.map((nh) => (
                  <tr key={nh.MaNH} className="hover:bg-blue-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 font-mono font-bold rounded-lg border border-blue-100">
                        {nh.MaNH}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-600">{fmtDate(nh.NgayNhap)}</td>
                    <td className="px-6 py-4 font-bold text-slate-800">{nh.TenNCC || <span className="text-slate-300 italic">Trống</span>}</td>
                    <td className="px-6 py-4 text-slate-600">{nh.TenNV || "—"}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-xl text-xs font-bold border border-indigo-100 shadow-sm">
                        {nh.SoLuongDong} SP
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-extrabold text-emerald-600 tracking-tight text-base">{fmtMoney(nh.TongTien)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => navigate(`/admin/nhap-hang/${nh.MaNH}`)}
                          className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-blue-600 hover:text-white text-xs font-bold transition-all shadow-sm hover:shadow-lg"
                        >
                          Chi Tiết
                        </button>
                        <button
                          onClick={() => handleDelete(nh.MaNH)}
                          disabled={deleting === nh.MaNH}
                          className="px-4 py-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white text-xs font-bold transition-all shadow-sm hover:shadow-lg disabled:opacity-50"
                        >
                          {deleting === nh.MaNH ? "..." : "Xóa"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-5 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-slate-500 font-medium text-sm">
              Hiển thị <span className="font-bold text-slate-700">{(page - 1) * limit + 1}</span> đến <span className="font-bold text-slate-700">{Math.min(page * limit, total)}</span> trong <span className="font-bold text-slate-700">{total}</span> kết quả
            </span>
            <div className="flex gap-2 bg-white p-1 rounded-2xl shadow-sm border border-slate-200">
              <button onClick={() => setPage(p => p - 1)} disabled={page === 1}
                className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-40 transition-colors font-bold">
                ←
              </button>
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map(n => (
                <button key={n} onClick={() => setPage(n)}
                  className={`w-10 h-10 flex items-center justify-center rounded-xl font-bold transition-all ${
                    n === page 
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/30" 
                    : "text-slate-600 hover:bg-slate-100"
                  }`}>
                  {n}
                </button>
              ))}
              <button onClick={() => setPage(p => p + 1)} disabled={page === totalPages}
                className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-40 transition-colors font-bold">
                →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NhapHangList;
