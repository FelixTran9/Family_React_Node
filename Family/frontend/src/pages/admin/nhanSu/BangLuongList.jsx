import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import adminApi from "../../../services/adminApi";

const now = new Date();

const BangLuongList = () => {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [staffs, setStaffs] = useState([]);
  const [filters, setFilters] = useState({
    thang: String(now.getMonth() + 1),
    nam: String(now.getFullYear()),
    maNV: "",
  });

  // Modal tính lương hàng loạt
  const [showTinhLuong, setShowTinhLuong] = useState(false);
  const [tinhForm, setTinhForm] = useState({
    Thang: String(now.getMonth() + 1),
    Nam: String(now.getFullYear()),
    LuongCoBanMacDinh: 5000000,
    PhuCap: 300000,
    KhauTru: 0,
  });
  const [tinhLoading, setTinhLoading] = useState(false);
  const [tinhMsg, setTinhMsg] = useState("");

  // Modal sửa
  const [editRow, setEditRow] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState("");

  const limit = 20;
  const totalPages = Math.ceil(total / limit);

  useEffect(() => {
    adminApi.get("/staff?limit=200").then(r => setStaffs(r.data.data || []));
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams({ ...filters, page, limit });
      const res = await adminApi.get(`/nhan-su/bang-luong?${p}`);
      setData(res.data.data || []);
      setTotal(res.data.total || 0);
    } catch { setData([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [filters, page]);

  const handleTinhLuong = async () => {
    if (!tinhForm.LuongCoBanMacDinh) { setTinhMsg("Vui lòng nhập lương cơ bản"); return; }
    setTinhLoading(true); setTinhMsg("");
    try {
      const res = await adminApi.post("/nhan-su/bang-luong/tinh-luong", tinhForm);
      setTinhMsg("✅ " + res.data.message);
      fetchData();
    } catch (err) {
      setTinhMsg("❌ " + (err.response?.data?.message || "Lỗi tính lương"));
    } finally { setTinhLoading(false); }
  };

  const handleThanhToan = async (id) => {
    if (!window.confirm("Xác nhận đã thanh toán lương cho nhân viên này?")) return;
    try {
      await adminApi.patch(`/nhan-su/bang-luong/${id}/thanh-toan`);
      fetchData();
    } catch { alert("Lỗi xác nhận thanh toán"); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Xóa bảng lương này?")) return;
    try {
      await adminApi.delete(`/nhan-su/bang-luong/${id}`);
      fetchData();
    } catch { alert("Lỗi xóa"); }
  };

  const openEdit = (row) => {
    setEditRow(row);
    setEditForm({
      SoNgayLam: row.SoNgayLam,
      SoGioLam: row.SoGioLam,
      LuongCoBan: row.LuongCoBan,
      PhuCap: row.PhuCap,
      KhauTru: row.KhauTru,
      TrangThai: row.TrangThai,
      GhiChu: row.GhiChu || "",
    });
    setEditError("");
  };

  const handleEditSave = async () => {
    setEditSaving(true);
    try {
      await adminApi.put(`/nhan-su/bang-luong/${editRow.MaBL}`, editForm);
      setEditRow(null);
      fetchData();
    } catch (err) {
      setEditError(err.response?.data?.message || "Lỗi cập nhật");
    } finally { setEditSaving(false); }
  };

  const fmtMoney = (n) => Number(n || 0).toLocaleString("vi-VN") + "₫";
  const tongLuong = data.reduce((s, d) => s + Number(d.TongLuong || 0), 0);
  const daTT = data.filter(d => d.TrangThai === "da_thanh_toan").length;

  const previewTong = editForm.LuongCoBan !== undefined
    ? Math.round((Number(editForm.SoNgayLam || 0) / 26) * Number(editForm.LuongCoBan) + Number(editForm.PhuCap || 0) - Number(editForm.KhauTru || 0))
    : 0;

  return (
    <div className="p-6 md:p-8 space-y-8 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
            <span className="text-4xl drop-shadow-md">💰</span> 
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-600">
              Bảng Lương
            </span>
          </h1>
          <p className="text-slate-500 font-medium text-sm mt-2 ml-1">
            Tổng hợp, tính toán và thanh toán lương nhân sự
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link to="/admin/nhan-su/cham-cong"
            className="inline-flex items-center gap-2 bg-white border-2 border-slate-200 hover:border-blue-300 text-slate-600 hover:text-blue-600 px-6 py-3 rounded-2xl font-bold text-sm transition-all shadow-sm hover:shadow-md">
            🕐 Chấm Công
          </Link>
          <button onClick={() => { setShowTinhLuong(true); setTinhMsg(""); }}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-2xl font-bold text-sm transition-all shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5">
            <span className="text-lg leading-none">⚡</span> Tính lương tự động
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-50 rounded-full blur-2xl group-hover:bg-blue-100 transition-colors"></div>
          <div className="relative">
             <div className="flex justify-between items-start mb-4">
               <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center text-xl shadow-inner">👥</div>
             </div>
             <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Mã NV Trả Lương</p>
             <p className="text-3xl font-black text-slate-800">{total}</p>
          </div>
        </div>
        <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-50 rounded-full blur-2xl group-hover:bg-emerald-100 transition-colors"></div>
          <div className="relative">
             <div className="flex justify-between items-start mb-4">
               <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center text-xl shadow-inner">✅</div>
             </div>
             <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Đã Thanh Toán</p>
             <p className="text-3xl font-black text-emerald-600">{daTT}</p>
          </div>
        </div>
        <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-amber-50 rounded-full blur-2xl group-hover:bg-amber-100 transition-colors"></div>
          <div className="relative">
             <div className="flex justify-between items-start mb-4">
               <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center text-xl shadow-inner">⏳</div>
             </div>
             <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Chưa Thanh Toán</p>
             <p className="text-3xl font-black text-amber-500">{total - daTT}</p>
          </div>
        </div>
        <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[2rem] p-6 shadow-xl shadow-blue-900/20 relative overflow-hidden text-white">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
          <div className="relative">
             <div className="flex justify-between items-start mb-4">
               <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-xl border border-white/20">💵</div>
             </div>
             <p className="text-xs font-bold text-blue-200 uppercase tracking-wider mb-1">Tổng Quỹ Lương Trang Này</p>
             <p className="text-3xl font-black tracking-tight">{fmtMoney(tongLuong)}</p>
          </div>
        </div>
      </div>

      {/* Filters Container */}
      <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/40 border border-slate-100 p-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="w-full md:w-32">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Tháng</label>
            <select className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all appearance-none"
              value={filters.thang} onChange={e => { setFilters(p => ({ ...p, thang: e.target.value })); setPage(1); }}>
              {Array.from({length:12},(_,i)=>i+1).map(m => <option key={m} value={m}>Tháng {m}</option>)}
            </select>
          </div>
          <div className="w-full md:w-32">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Năm</label>
            <select className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all appearance-none"
              value={filters.nam} onChange={e => { setFilters(p => ({ ...p, nam: e.target.value })); setPage(1); }}>
              {[2024,2025,2026,2027].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div className="w-full md:flex-1">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Nhân viên</label>
            <select className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all appearance-none"
              value={filters.maNV} onChange={e => { setFilters(p => ({ ...p, maNV: e.target.value })); setPage(1); }}>
              <option value="">-- Tất cả nhân viên --</option>
              {staffs.map(s => <option key={s.MaNV} value={s.MaNV}>{s.TenNV}</option>)}
            </select>
          </div>
          <button onClick={fetchData}
            className="w-full md:w-auto px-8 py-3 rounded-2xl bg-white border-2 border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50 text-sm font-bold shadow-sm active:scale-95 transition-all">
            Lọc Dữ Liệu
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 text-blue-500 gap-4">
            <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
            <p className="font-medium animate-pulse text-slate-500">Đang đồng bộ dữ liệu...</p>
          </div>
        ) : data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 px-4 text-center">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
              <span className="text-5xl opacity-50 grayscale">💵</span>
            </div>
            <h3 className="text-xl font-bold text-slate-700 mb-2">Chưa có bảng lương</h3>
            <p className="text-slate-500 max-w-sm mx-auto">Sử dụng nút "Tính lương tự động" để tạo dữ liệu cho tháng được chọn.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Nhân Viên</th>
                  <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Ngày Làm</th>
                  <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Lương Cơ Bản</th>
                  <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Phụ Cấp</th>
                  <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Khấu Trừ</th>
                  <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Trạng Thái</th>
                  <th className="px-6 py-5 text-xs font-bold text-sky-600 uppercase tracking-wider text-right">Thực Nhận</th>
                  <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {data.map(row => (
                  <tr key={row.MaBL} className="hover:bg-blue-50/50 transition-colors group">
                    <td className="px-6 py-4">
                       <p className="font-bold text-slate-800">{row.TenNV}</p>
                       <p className="text-[11px] font-medium text-slate-400">{row.MaNV}</p>
                    </td>
                    <td className="px-6 py-4 text-center">
                       <p className="font-bold text-slate-700">{row.SoNgayLam} <span className="font-normal text-slate-400">ngày</span></p>
                       <p className="text-[11px] font-medium text-slate-400">{Number(row.SoGioLam || 0).toFixed(1)}h</p>
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-slate-600">{fmtMoney(row.LuongCoBan)}</td>
                    <td className="px-6 py-4 text-right font-bold text-emerald-500">+{fmtMoney(row.PhuCap)}</td>
                    <td className="px-6 py-4 text-right font-bold text-red-500">-{fmtMoney(row.KhauTru)}</td>
                    <td className="px-6 py-4 text-center">
                      {row.TrangThai === "da_thanh_toan" ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Đã TT
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 text-amber-600 border border-amber-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span> Chờ TT
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                       <span className="font-black text-blue-600 text-lg tracking-tight bg-blue-50 px-3 py-1 rounded-lg">
                         {fmtMoney(row.TongLuong)}
                       </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEdit(row)} title="Sửa"
                          className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-amber-500 hover:text-white font-medium transition-all shadow-sm">
                          ✏️
                        </button>
                        {row.TrangThai === "chua_thanh_toan" && (
                          <button onClick={() => handleThanhToan(row.MaBL)} title="Xác nhận thanh toán"
                            className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-emerald-500 hover:text-white font-medium transition-all shadow-sm">
                            💸
                          </button>
                        )}
                        <button onClick={() => handleDelete(row.MaBL)} title="Xóa"
                          className="w-8 h-8 flex items-center justify-center rounded-xl bg-red-50 text-red-600 hover:bg-red-500 hover:text-white font-medium transition-all shadow-sm">
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="px-6 py-5 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
            <span className="text-slate-500 font-medium text-sm">Trang {page} / {totalPages}</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p=>p-1)} disabled={page===1}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 font-bold text-slate-600 text-sm shadow-sm transition-all">Trở lại</button>
              <button onClick={() => setPage(p=>p+1)} disabled={page===totalPages}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 font-bold text-slate-600 text-sm shadow-sm transition-all">Tiếp</button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Tính Lương Hàng Loạt */}
      {showTinhLuong && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowTinhLuong(false)}></div>
          <div className="bg-white rounded-[2rem] shadow-2xl shadow-blue-900/20 w-full max-w-md overflow-hidden relative z-10 animate-scale-in">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-extrabold text-slate-800 text-xl flex items-center gap-2">⚡ Tính Lương Hàng Loạt</h2>
              <button onClick={() => setShowTinhLuong(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-sm">✕</button>
            </div>
            <div className="p-8 space-y-5">
              <p className="text-sm font-medium text-blue-700 bg-blue-50/50 rounded-2xl px-5 py-4 border border-blue-100 leading-relaxed shadow-inner">
                Tự động tạo bảng lương cho <strong>tất cả</strong> nhân viên dựa trên nhật ký chấm công của tháng được chọn.
              </p>
              
              {tinhMsg && (
                <div className={`rounded-2xl px-5 py-4 text-sm font-bold shadow-inner ${tinhMsg.startsWith("✅") ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-red-50 text-red-600 border border-red-100"}`}>
                  {tinhMsg}
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Tháng</label>
                  <select className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-blue-500 appearance-none"
                    value={tinhForm.Thang} onChange={e => setTinhForm(p=>({...p,Thang:e.target.value}))}>
                    {Array.from({length:12},(_,i)=>i+1).map(m=><option key={m} value={m}>Tháng {m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Năm</label>
                  <select className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-blue-500 appearance-none"
                    value={tinhForm.Nam} onChange={e => setTinhForm(p=>({...p,Nam:e.target.value}))}>
                    {[2024,2025,2026,2027].map(y=><option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Lương cơ bản (26 ngày) <span className="text-red-500">*</span></label>
                  <input type="number" min="0" step="100000"
                    className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-base font-black text-slate-700 outline-none focus:border-blue-500"
                    value={tinhForm.LuongCoBanMacDinh}
                    onChange={e => setTinhForm(p=>({...p,LuongCoBanMacDinh:Number(e.target.value)}))} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Phụ cấp chung</label>
                  <input type="number" min="0" step="10000"
                    className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold text-emerald-600 outline-none focus:border-blue-500"
                    value={tinhForm.PhuCap}
                    onChange={e => setTinhForm(p=>({...p,PhuCap:Number(e.target.value)}))} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Trừ quỹ/BHXH</label>
                  <input type="number" min="0" step="10000"
                    className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold text-red-500 outline-none focus:border-blue-500"
                    value={tinhForm.KhauTru}
                    onChange={e => setTinhForm(p=>({...p,KhauTru:Number(e.target.value)}))} />
                </div>
              </div>
            </div>
            <div className="px-8 py-5 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button onClick={() => setShowTinhLuong(false)}
                className="px-6 py-3 rounded-2xl border-2 border-slate-200 text-slate-600 hover:bg-white font-bold text-sm transition-colors">Hủy</button>
              <button onClick={handleTinhLuong} disabled={tinhLoading}
                className="px-8 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-sm shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 active:scale-95 disabled:opacity-50 transition-all">
                {tinhLoading ? "Hệ thống đang tính..." : "Chạy Tính Lương"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Sửa Bảng Lương Cá Nhân */}
      {editRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setEditRow(null)}></div>
          <div className="bg-white rounded-[2rem] shadow-2xl shadow-blue-900/20 w-full max-w-md overflow-hidden relative z-10 animate-scale-in">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="font-extrabold text-slate-800 text-xl flex items-center gap-2 mb-1">✏️ Điều Chỉnh Cá Nhân</h2>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{editRow.TenNV} • Tháng {editRow.Thang}/{editRow.Nam}</p>
              </div>
              <button onClick={() => setEditRow(null)} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-sm">✕</button>
            </div>
            
            <div className="p-8 space-y-5">
              {editError && <div className="bg-red-50 text-red-600 border border-red-200 rounded-xl px-4 py-3 text-sm font-bold shadow-inner">{editError}</div>}
              
              <div className="grid grid-cols-2 gap-5">
                {[
                  ["SoNgayLam","Số ngày làm","number"],
                  ["SoGioLam","Số giờ làm","number"],
                  ["LuongCoBan","Lương cơ bản","number"],
                  ["PhuCap","Phụ cấp (+)","number"],
                  ["KhauTru","Khấu trừ (-)","number"],
                ].map(([key, label, type]) => (
                  <div key={key} className={key === "LuongCoBan" ? "col-span-2" : ""}>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{label}</label>
                    <input type={type} min="0"
                      className={`w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:border-blue-500 transition-colors ${
                         key === "PhuCap" ? "text-emerald-600" :
                         key === "KhauTru" ? "text-red-500" : "text-slate-700"
                      }`}
                      value={editForm[key] || 0}
                      onChange={e => setEditForm(p=>({...p,[key]:Number(e.target.value)}))} />
                  </div>
                ))}
                
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Trạng thái thanh toán</label>
                  <select className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-blue-500 appearance-none"
                    value={editForm.TrangThai} onChange={e => setEditForm(p=>({...p,TrangThai:e.target.value}))}>
                    <option value="chua_thanh_toan">⏳ Chưa thanh toán</option>
                    <option value="da_thanh_toan">✅ Đã thanh toán</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Ghi chú</label>
                  <input type="text" placeholder="Thưởng lễ, phạt đi trễ..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:border-blue-500"
                    value={editForm.GhiChu}
                    onChange={e => setEditForm(p=>({...p,GhiChu:e.target.value}))} />
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl px-5 py-4 flex items-center justify-between border border-blue-100 mt-2 shadow-inner">
                <span className="text-xs font-bold text-blue-800 uppercase tracking-wider">Hạch Toán Tạm Tính</span>
                <span className="text-xl font-black text-blue-700">{Number(previewTong || 0).toLocaleString("vi-VN")}₫</span>
              </div>
            </div>
            
            <div className="px-8 py-5 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button onClick={() => setEditRow(null)}
                className="px-6 py-3 rounded-2xl border-2 border-slate-200 text-slate-600 hover:bg-white font-bold text-sm transition-colors">Hủy</button>
              <button onClick={handleEditSave} disabled={editSaving}
                className="px-8 py-3 rounded-2xl bg-blue-600 text-white font-bold text-sm shadow-lg shadow-blue-500/30 hover:bg-blue-700 active:scale-95 disabled:opacity-50 transition-all">
                {editSaving ? "Đang lưu..." : "💾 Cập Nhật"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BangLuongList;
