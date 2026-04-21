import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import adminApi from "../../../services/adminApi";

const TRANG_THAI_MAP = {
  di_lam:    { label: "Đi làm",     icon: "☀️", cls: "bg-emerald-50 text-emerald-600 border-emerald-200" },
  nghi_phep: { label: "Nghỉ phép",  icon: "🌴", cls: "bg-amber-50 text-amber-600 border-amber-200" },
  vang_mat:  { label: "Vắng mặt",   icon: "❌", cls: "bg-red-50 text-red-600 border-red-200" },
  lam_them:  { label: "Làm thêm",   icon: "🌙", cls: "bg-purple-50 text-purple-600 border-purple-200" },
};

const now = new Date();
const ChamCongList = () => {
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
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ MaNV: "", NgayLam: "", GioVao: "", GioRa: "", TrangThai: "di_lam", GhiChu: "" });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const limit = 20;
  const totalPages = Math.ceil(total / limit);

  useEffect(() => {
    adminApi.get("/staff?limit=200").then(r => setStaffs(r.data.data || []));
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams({ ...filters, page, limit });
      const res = await adminApi.get(`/nhan-su/cham-cong?${p}`);
      setData(res.data.data || []);
      setTotal(res.data.total || 0);
    } catch { setData([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [filters, page]);

  const openCreate = () => {
    setEditId(null);
    setForm({ MaNV: "", NgayLam: "", GioVao: "", GioRa: "", TrangThai: "di_lam", GhiChu: "" });
    setFormError("");
    setShowForm(true);
  };

  const openEdit = (row) => {
    setEditId(row.MaCC);
    setForm({
      MaNV: row.MaNV, NgayLam: row.NgayLam?.substring(0,10) || "",
      GioVao: row.GioVao || "", GioRa: row.GioRa || "",
      TrangThai: row.TrangThai, GhiChu: row.GhiChu || "",
    });
    setFormError("");
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.MaNV || !form.NgayLam || !form.TrangThai) {
      setFormError("Vui lòng điền nhân viên, ngày làm và trạng thái");
      return;
    }
    setSaving(true);
    try {
      if (editId) {
        await adminApi.put(`/nhan-su/cham-cong/${editId}`, form);
      } else {
        await adminApi.post("/nhan-su/cham-cong", form);
      }
      setShowForm(false);
      fetchData();
    } catch (err) {
      setFormError(err.response?.data?.message || "Lỗi lưu dữ liệu");
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Xóa bản ghi chấm công này?")) return;
    try {
      await adminApi.delete(`/nhan-su/cham-cong/${id}`);
      fetchData();
    } catch { alert("Lỗi xóa"); }
  };

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString("vi-VN") : "—";
  
  const stats = {
    di_lam: data.filter(d => d.TrangThai === "di_lam").length,
    nghi_phep: data.filter(d => d.TrangThai === "nghi_phep").length,
    vang_mat: data.filter(d => d.TrangThai === "vang_mat").length,
  };

  return (
    <div className="p-6 md:p-8 space-y-8 bg-slate-50 min-h-screen relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
            <span className="text-4xl drop-shadow-md">🕐</span> 
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-600 to-blue-600">
              Quản lý Chấm Công
            </span>
          </h1>
          <p className="text-slate-500 font-medium text-sm mt-2 ml-1">
            Theo dõi, quản lý giờ giấc làm việc của nhân viên
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link to="/admin/nhan-su/bang-luong"
            className="inline-flex items-center gap-2 bg-white border-2 border-slate-200 hover:border-blue-300 text-slate-600 hover:text-blue-600 px-6 py-3 rounded-2xl font-bold text-sm transition-all shadow-sm hover:shadow-md">
            📊 Bảng Lương
          </Link>
          <button onClick={openCreate}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white px-6 py-3 rounded-2xl font-bold text-sm transition-all shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5">
            <span className="text-lg leading-none">+</span> Chấm Công
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
         <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xl shadow-slate-200/40 flex items-center gap-4">
           <div className="w-14 h-14 rounded-full bg-slate-50 flex items-center justify-center text-2xl border border-slate-100 shadow-inner">
             📋
           </div>
           <div>
             <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tổng bản ghi</p>
             <p className="text-2xl font-black text-slate-700">{total}</p>
           </div>
         </div>
         <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xl shadow-slate-200/40 flex items-center gap-4">
           <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center text-2xl border border-emerald-100 shadow-inner text-emerald-600">
             ☀️
           </div>
           <div>
             <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Đi làm</p>
             <p className="text-2xl font-black text-emerald-600">{stats.di_lam}</p>
           </div>
         </div>
         <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xl shadow-slate-200/40 flex items-center gap-4">
           <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center text-2xl border border-amber-100 shadow-inner text-amber-600">
             🌴
           </div>
           <div>
             <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Nghỉ phép</p>
             <p className="text-2xl font-black text-amber-600">{stats.nghi_phep}</p>
           </div>
         </div>
         <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xl shadow-slate-200/40 flex items-center gap-4">
           <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center text-2xl border border-red-100 shadow-inner text-red-600">
             ❌
           </div>
           <div>
             <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Vắng mặt</p>
             <p className="text-2xl font-black text-red-600">{stats.vang_mat}</p>
           </div>
         </div>
      </div>

      {/* Filters Container */}
      <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/40 border border-slate-100 p-6 relative overflow-hidden">
        <div className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-teal-400 to-blue-500"></div>
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
            className="w-full md:w-auto px-8 py-3 rounded-2xl bg-slate-800 text-white text-sm font-bold shadow-lg hover:shadow-slate-500/30 hover:bg-slate-700 active:scale-95 transition-all">
            Áp Dụng Filter
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 text-teal-500 gap-4">
            <div className="w-10 h-10 border-4 border-teal-500/30 border-t-teal-500 rounded-full animate-spin" />
            <p className="font-medium animate-pulse text-slate-500">Đang đồng bộ dữ liệu...</p>
          </div>
        ) : data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 px-4 text-center">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
              <span className="text-5xl opacity-50 grayscale">🕐</span>
            </div>
            <h3 className="text-xl font-bold text-slate-700 mb-2">Không có dữ liệu</h3>
            <p className="text-slate-500 max-w-sm mx-auto">Chưa có bản ghi chấm công nào phù hợp với bộ lọc hiện tại.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Nhân Viên</th>
                  <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Ngày Làm</th>
                  <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">In / Out</th>
                  <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Tổng Giờ</th>
                  <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Trạng Thái</th>
                  <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Ghi Chú</th>
                  <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {data.map(row => {
                  const tt = TRANG_THAI_MAP[row.TrangThai] || { label: row.TrangThai, icon: "?", cls: "bg-slate-50 text-slate-600 border-slate-200" };
                  return (
                    <tr key={row.MaCC} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-6 py-4 font-bold text-slate-800">{row.TenNV}</td>
                      <td className="px-6 py-4 text-center font-medium text-slate-600">{fmtDate(row.NgayLam)}</td>
                      <td className="px-6 py-4 text-center">
                         <div className="inline-flex gap-2 font-mono text-slate-500 text-xs font-bold bg-white px-3 py-1.5 rounded-lg border border-slate-100 shadow-sm">
                           <span className="text-emerald-500">{row.GioVao?.substring(0,5) || "—"}</span>
                           <span className="text-slate-300">-</span>
                           <span className="text-amber-500">{row.GioRa?.substring(0,5) || "—"}</span>
                         </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                         <span className="text-base font-black text-blue-600">
                           {Number(row.SoGioLam || 0).toFixed(1)}<span className="text-xs text-blue-400 ml-0.5">h</span>
                         </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border shadow-sm ${tt.cls}`}>
                          <span>{tt.icon}</span> {tt.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-xs max-w-[140px] truncate" title={row.GhiChu}>
                        {row.GhiChu || <span className="italic text-slate-300">—</span>}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openEdit(row)}
                            className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-blue-600 hover:text-white font-medium transition-all shadow-sm hover:shadow-lg">
                            ✏️
                          </button>
                          <button onClick={() => handleDelete(row.MaCC)}
                            className="w-8 h-8 flex items-center justify-center rounded-xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white font-medium transition-all shadow-sm hover:shadow-lg">
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
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

      {/* Modern Modal Overlay */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => setShowForm(false)}></div>
          <div className="bg-white rounded-[2rem] shadow-2xl shadow-blue-900/20 w-full max-w-lg overflow-hidden relative z-10 animate-scale-in">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h2 className="font-extrabold text-slate-800 text-xl tracking-tight flex items-center gap-2">
                {editId ? <><span className="text-blue-500">✏️</span> Sửa Chấm Công</> : <><span className="text-emerald-500">➕</span> Chấm Công Mới</>}
              </h2>
              <button onClick={() => setShowForm(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 transition-colors font-bold text-sm">✕</button>
            </div>
            
            <div className="p-8 space-y-5">
              {formError && (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-xl px-4 py-3 text-sm flex items-center gap-2 font-medium">
                  <span className="text-lg">⚠️</span> {formError}
                </div>
              )}
              
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Nhân viên <span className="text-red-500">*</span></label>
                  <select disabled={!!editId}
                    className="w-full border border-slate-200 rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:bg-slate-100 appearance-none bg-slate-50"
                    value={form.MaNV} onChange={e => setForm(p => ({ ...p, MaNV: e.target.value }))}>
                    <option value="" disabled>-- Chọn nhân viên --</option>
                    {staffs.map(s => <option key={s.MaNV} value={s.MaNV}>{s.TenNV}</option>)}
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-5">
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Ngày làm <span className="text-red-500">*</span></label>
                    <input type="date" disabled={!!editId}
                      className="w-full border border-slate-200 rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:bg-slate-100 bg-slate-50"
                      value={form.NgayLam} onChange={e => setForm(p => ({ ...p, NgayLam: e.target.value }))} />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Trạng thái <span className="text-red-500">*</span></label>
                    <select className="w-full border border-slate-200 rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none bg-slate-50"
                      value={form.TrangThai} onChange={e => setForm(p => ({ ...p, TrangThai: e.target.value }))}>
                      <option value="di_lam">Đi làm</option>
                      <option value="nghi_phep">Nghỉ phép</option>
                      <option value="vang_mat">Vắng mặt</option>
                      <option value="lam_them">Làm thêm</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-5">
                   <div>
                     <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Giờ IN</label>
                     <input type="time" className="w-full border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 bg-slate-50 font-mono"
                       value={form.GioVao} onChange={e => setForm(p => ({ ...p, GioVao: e.target.value }))} />
                   </div>
                   <div>
                     <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Giờ OUT</label>
                     <input type="time" className="w-full border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 bg-slate-50 font-mono"
                       value={form.GioRa} onChange={e => setForm(p => ({ ...p, GioRa: e.target.value }))} />
                   </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Ghi chú thêm</label>
                  <textarea className="w-full border border-slate-200 rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 bg-slate-50 resize-none h-24"
                    placeholder="Diễn giải đi trễ, về sớm..." value={form.GhiChu} onChange={e => setForm(p => ({ ...p, GhiChu: e.target.value }))} />
                </div>
              </div>
            </div>
            
            <div className="px-8 py-5 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button onClick={() => setShowForm(false)}
                className="px-6 py-3 rounded-2xl border-2 border-slate-200 text-slate-600 hover:bg-slate-100 hover:border-slate-300 font-bold text-sm transition-all active:scale-95">
                Hủy
              </button>
              <button onClick={handleSave} disabled={saving}
                className="px-8 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm transition-all shadow-lg shadow-blue-500/30 active:scale-95 disabled:opacity-50 disabled:grayscale">
                {saving ? "Đang xử lý..." : "Lưu Thay Đổi"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChamCongList;
