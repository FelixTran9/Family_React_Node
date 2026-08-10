import crypto from "crypto";
import pool from "../config/db.js";

// Bảng DOT_KHUYEN_MAI: MaKM, TenCT, TuNgay, DenNgay, MoTa
// Bảng CT_KHUYEN_MAI: MaKM, MaSP, GiamGiaPhanTram, GiamGiaTien, MuaToiThieu
// MoTa lưu JSON: { text, img, kieuKM, soLuongMua, soLuongTang }

const genMaKM = () => "KM" + crypto.randomBytes(3).toString("hex").toUpperCase();

/** Parse MoTa field (JSON hoặc plain text) */
const parseMoTa = (moTa) => {
  if (!moTa) return { text: "", img: null, kieuKM: "chiet_khau", soLuongMua: null, soLuongTang: null };
  try { return JSON.parse(moTa); } catch { return { text: moTa, img: null, kieuKM: "chiet_khau", soLuongMua: null, soLuongTang: null }; }
};

/**
 * GET /api/admin/promotions?q=...&page=1&limit=15
 */
export const getPromotions = async (req, res) => {
  const { q = "", page = 1, limit = 15 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);
  const search = `%${q}%`;
  try {
    const [rows] = await pool.query(
      `SELECT d.*, COUNT(ct.MaSP) AS SoSanPham
       FROM DOT_KHUYEN_MAI d
       LEFT JOIN CT_KHUYEN_MAI ct ON d.MaKM = ct.MaKM
       WHERE d.MaKM LIKE ? OR d.TenCT LIKE ?
       GROUP BY d.MaKM
       ORDER BY d.MaKM DESC LIMIT ? OFFSET ?`,
      [search, search, parseInt(limit), offset]
    );
    const [[{ total }]] = await pool.query(
      "SELECT COUNT(*) AS total FROM DOT_KHUYEN_MAI WHERE MaKM LIKE ? OR TenCT LIKE ?",
      [search, search]
    );
    const data = rows.map(r => ({ ...r, ...parseMoTa(r.MoTa) }));
    res.json({ data, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    res.status(500).json({ message: "Lỗi lấy danh sách khuyến mãi", error: err.message });
  }
};

/**
 * GET /api/promotions — Public: Lấy các đợt KM đang hoạt động (cho trang web + Cart)
 */
export const getPublicPromotions = async (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const [rows] = await pool.query(
      `SELECT MaKM, TenCT, TuNgay, DenNgay, MoTa FROM DOT_KHUYEN_MAI
       WHERE TuNgay <= ? AND DenNgay >= ?
       ORDER BY MaKM DESC`,
      [today, today]
    );
    const result = [];
    for (const km of rows) {
      const [chiTiet] = await pool.query(
        `SELECT ct.*, sp.TenSP, sp.GiaBan FROM CT_KHUYEN_MAI ct
         LEFT JOIN SAN_PHAM sp ON ct.MaSP = sp.MaSP
         WHERE ct.MaKM = ?`,
        [km.MaKM]
      );
      result.push({ ...km, ...parseMoTa(km.MoTa), chiTiet });
    }
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: "Lỗi lấy khuyến mãi", error: err.message });
  }
};

/**
 * GET /api/customers/:sdt/vip — Public: Kiểm tra hạng VIP của khách hàng theo SĐT
 */
export const getKhachHangVip = async (req, res) => {
  try {
    const { sdt } = req.params;
    const [kh] = await pool.query(
      "SELECT MaKH, TenKH, LoaiKH, DiemTichLuy, TongTieuDung, KhuyenMaiUuTien FROM KHACH_HANG WHERE SDT = ?",
      [sdt]
    );
    if (kh.length === 0) return res.json({ level: "thuong", phanTram: 0, label: "👤 Khách thường", soDon: 0, tongChiTieu: 0 });

    const khachHang = kh[0];
    const MaKH = khachHang.MaKH;

    // Lấy thống kê đơn hàng đã giao
    const [[stats]] = await pool.query(
      `SELECT COUNT(*) as SoDon, COALESCE(SUM(TongThanhToan), 0) as TongChiTieu
       FROM DON_BAN_HANG WHERE MaKH = ? AND TrangThai = 'đã_giao'`,
      [MaKH]
    );

    // Thử lấy từ bảng PHAN_LOAI_KHACH_HANG
    const [phanLoai] = await pool.query(
      "SELECT HangKH FROM PHAN_LOAI_KHACH_HANG WHERE MaKH = ? ORDER BY NgayPhanLoai DESC LIMIT 1",
      [MaKH]
    );

    const soDon = parseInt(stats.SoDon);
    const tongChiTieu = parseFloat(stats.TongChiTieu);
    const hangKH = phanLoai[0]?.HangKH || khachHang.LoaiKH || null;

    let level, phanTram, label;
    // Ưu tiên dùng HangKH từ DB nếu có
    if (hangKH === "KimCuong" || soDon >= 20 || tongChiTieu >= 5000000) {
      level = "kim_cuong"; phanTram = 15; label = "💎 Kim cương";
    } else if (hangKH === "Vang" || soDon >= 10 || tongChiTieu >= 2000000) {
      level = "vang"; phanTram = 10; label = "🥇 Vàng";
    } else if (hangKH === "Bac" || soDon >= 3 || tongChiTieu >= 500000) {
      level = "bac"; phanTram = 5; label = "🥈 Bạc";
    } else {
      level = "thuong"; phanTram = 0; label = "👤 Khách thường";
    }

    res.json({ level, phanTram, label, soDon, tongChiTieu, MaKH, TenKH: khachHang.TenKH, DiemTichLuy: khachHang.DiemTichLuy });
  } catch (err) {
    res.status(500).json({ message: "Lỗi kiểm tra VIP", error: err.message });
  }
};

/**
 * GET /api/admin/promotions/:id
 */
export const getPromotionById = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM DOT_KHUYEN_MAI WHERE MaKM = ?", [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: "Không tìm thấy khuyến mãi" });

    const [chiTiet] = await pool.query(
      `SELECT ct.*, sp.TenSP, sp.GiaBan FROM CT_KHUYEN_MAI ct
       LEFT JOIN SAN_PHAM sp ON ct.MaSP = sp.MaSP
       WHERE ct.MaKM = ?`,
      [req.params.id]
    );
    res.json({ ...rows[0], ...parseMoTa(rows[0].MoTa), chiTiet });
  } catch (err) {
    res.status(500).json({ message: "Lỗi lấy khuyến mãi", error: err.message });
  }
};

/**
 * GET /api/admin/promotions/san-pham
 */
export const getSanPhamChoKM = async (req, res) => {
  const { q = "" } = req.query;
  try {
    const search = `%${q}%`;
    const [rows] = await pool.query(
      `SELECT MaSP, TenSP, GiaBan FROM SAN_PHAM
       WHERE (TenSP LIKE ? OR MaSP LIKE ?)
       ORDER BY TenSP ASC LIMIT 50`,
      [search, search]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Lỗi lấy sản phẩm", error: err.message });
  }
};

/**
 * POST /api/admin/promotions
 * Body: { TenCT, TuNgay, DenNgay, MoTa(text), img, kieuKM, soLuongMua, soLuongTang, chiTiet }
 */
export const createPromotion = async (req, res) => {
  const { TenCT, TuNgay, DenNgay, text, img, kieuKM, soLuongMua, soLuongTang, chiTiet = [] } = req.body;
  if (!TenCT || !TuNgay || !DenNgay) {
    return res.status(400).json({ message: "Thiếu thông tin bắt buộc (TenCT, TuNgay, DenNgay)" });
  }
  const MoTa = JSON.stringify({ text: text || "", img: img || null, kieuKM: kieuKM || "chiet_khau", soLuongMua: soLuongMua || null, soLuongTang: soLuongTang || null });
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    let MaKM = genMaKM();
    let [check] = await conn.query("SELECT MaKM FROM DOT_KHUYEN_MAI WHERE MaKM = ?", [MaKM]);
    while (check.length > 0) { MaKM = genMaKM(); [check] = await conn.query("SELECT MaKM FROM DOT_KHUYEN_MAI WHERE MaKM = ?", [MaKM]); }
    await conn.query(
      `INSERT INTO DOT_KHUYEN_MAI (MaKM, TenCT, TuNgay, DenNgay, MoTa) VALUES (?, ?, ?, ?, ?)`,
      [MaKM, TenCT, TuNgay, DenNgay, MoTa]
    );
    for (const item of chiTiet) {
      if (!item.MaSP) continue;
      await conn.query(
        `INSERT INTO CT_KHUYEN_MAI (MaKM, MaSP, GiamGiaPhanTram, GiamGiaTien, MuaToiThieu) VALUES (?, ?, ?, ?, ?)`,
        [MaKM, item.MaSP, parseFloat(item.GiamGiaPhanTram) || 0, parseFloat(item.GiamGiaTien) || 0, parseInt(item.MuaToiThieu) || 1]
      );
    }
    await conn.commit();
    res.status(201).json({ message: "Tạo khuyến mãi thành công", MaKM });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ message: "Lỗi tạo khuyến mãi", error: err.message });
  } finally { conn.release(); }
};

/**
 * PUT /api/admin/promotions/:id
 */
export const updatePromotion = async (req, res) => {
  const { TenCT, TuNgay, DenNgay, text, img, kieuKM, soLuongMua, soLuongTang, chiTiet = [] } = req.body;
  if (!TenCT || !TuNgay || !DenNgay) {
    return res.status(400).json({ message: "Thiếu thông tin bắt buộc" });
  }
  const MoTa = JSON.stringify({ text: text || "", img: img || null, kieuKM: kieuKM || "chiet_khau", soLuongMua: soLuongMua || null, soLuongTang: soLuongTang || null });
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query(`UPDATE DOT_KHUYEN_MAI SET TenCT=?, TuNgay=?, DenNgay=?, MoTa=? WHERE MaKM=?`, [TenCT, TuNgay, DenNgay, MoTa, req.params.id]);
    await conn.query("DELETE FROM CT_KHUYEN_MAI WHERE MaKM=?", [req.params.id]);
    for (const item of chiTiet) {
      if (!item.MaSP) continue;
      await conn.query(
        `INSERT INTO CT_KHUYEN_MAI (MaKM, MaSP, GiamGiaPhanTram, GiamGiaTien, MuaToiThieu) VALUES (?, ?, ?, ?, ?)`,
        [req.params.id, item.MaSP, parseFloat(item.GiamGiaPhanTram) || 0, parseFloat(item.GiamGiaTien) || 0, parseInt(item.MuaToiThieu) || 1]
      );
    }
    await conn.commit();
    res.json({ message: "Cập nhật khuyến mãi thành công" });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ message: "Lỗi cập nhật khuyến mãi", error: err.message });
  } finally { conn.release(); }
};

/**
 * DELETE /api/admin/promotions/:id
 */
export const deletePromotion = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query("DELETE FROM CT_KHUYEN_MAI WHERE MaKM=?", [req.params.id]);
    await conn.query("DELETE FROM DOT_KHUYEN_MAI WHERE MaKM=?", [req.params.id]);
    await conn.commit();
    res.json({ message: "Xóa khuyến mãi thành công" });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ message: "Lỗi xóa khuyến mãi", error: err.message });
  } finally { conn.release(); }
};
