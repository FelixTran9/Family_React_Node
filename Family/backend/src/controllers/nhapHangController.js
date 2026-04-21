import crypto from "crypto";
import pool from "../config/db.js";

const genMaNH = () => "NH" + crypto.randomBytes(3).toString("hex").toUpperCase();
const genMaCTNH = () => "CTNH" + crypto.randomBytes(3).toString("hex").toUpperCase();

/**
 * GET /api/admin/nhap-hang?q=&page=1&limit=15
 */
export const getNhapHangList = async (req, res) => {
  const { q = "", page = 1, limit = 15, from = "", to = "" } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);
  const search = `%${q}%`;
  try {
    let whereClause = "WHERE (nh.MaNH LIKE ? OR ncc.TenNCC LIKE ? OR nv.TenNV LIKE ?)";
    let params = [search, search, search];
    if (from) { whereClause += " AND DATE(nh.NgayNhap) >= ?"; params.push(from); }
    if (to)   { whereClause += " AND DATE(nh.NgayNhap) <= ?"; params.push(to); }

    const [rows] = await pool.query(
      `SELECT nh.MaNH, nh.NgayNhap, nh.TongTien, nh.GhiChu,
              ncc.TenNCC, ncc.MaNCC,
              nv.TenNV, nv.MaNV,
              COUNT(ct.MaCTNH) AS SoLuongDong
       FROM PHIEU_NHAP_HANG nh
       LEFT JOIN NHA_CUNG_CAP ncc ON nh.MaNCC = ncc.MaNCC
       LEFT JOIN NHAN_VIEN nv ON nh.MaNV = nv.MaNV
       LEFT JOIN CT_NHAP_HANG ct ON nh.MaNH = ct.MaNH
       ${whereClause}
       GROUP BY nh.MaNH
       ORDER BY nh.NgayNhap DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(DISTINCT nh.MaNH) AS total
       FROM PHIEU_NHAP_HANG nh
       LEFT JOIN NHA_CUNG_CAP ncc ON nh.MaNCC = ncc.MaNCC
       LEFT JOIN NHAN_VIEN nv ON nh.MaNV = nv.MaNV
       ${whereClause}`,
      params
    );

    res.json({ data: rows, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    res.status(500).json({ message: "Lỗi lấy danh sách phiếu nhập hàng", error: err.message });
  }
};

/**
 * GET /api/admin/nhap-hang/:id
 */
export const getNhapHangById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT nh.*, ncc.TenNCC, nv.TenNV
       FROM PHIEU_NHAP_HANG nh
       LEFT JOIN NHA_CUNG_CAP ncc ON nh.MaNCC = ncc.MaNCC
       LEFT JOIN NHAN_VIEN nv ON nh.MaNV = nv.MaNV
       WHERE nh.MaNH = ?`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: "Không tìm thấy phiếu nhập hàng" });

    const [chiTiet] = await pool.query(
      `SELECT ct.*, sp.TenSP, sp.DonViTinh, sp.GiaVon
       FROM CT_NHAP_HANG ct
       LEFT JOIN SAN_PHAM sp ON ct.MaSP = sp.MaSP
       WHERE ct.MaNH = ?`,
      [req.params.id]
    );

    res.json({ ...rows[0], chiTiet });
  } catch (err) {
    res.status(500).json({ message: "Lỗi lấy phiếu nhập hàng", error: err.message });
  }
};

/**
 * POST /api/admin/nhap-hang
 */
export const createNhapHang = async (req, res) => {
  const { MaNCC, MaNV, GhiChu, chiTiet } = req.body;
  if (!MaNCC || !MaNV || !chiTiet || chiTiet.length === 0) {
    return res.status(400).json({ message: "Thiếu thông tin bắt buộc (Nhà cung cấp, Nhân viên, Chi tiết sản phẩm)" });
  }
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    let MaNH = genMaNH();
    let [check] = await conn.query("SELECT MaNH FROM PHIEU_NHAP_HANG WHERE MaNH = ?", [MaNH]);
    while (check.length > 0) {
      MaNH = genMaNH();
      [check] = await conn.query("SELECT MaNH FROM PHIEU_NHAP_HANG WHERE MaNH = ?", [MaNH]);
    }

    const TongTien = chiTiet.reduce((sum, ct) => sum + ct.SoLuong * ct.DonGiaNhap, 0);

    await conn.query(
      "INSERT INTO PHIEU_NHAP_HANG (MaNH, MaNCC, MaNV, NgayNhap, TongTien, GhiChu) VALUES (?, ?, ?, NOW(), ?, ?)",
      [MaNH, MaNCC, MaNV, TongTien, GhiChu || null]
    );

    for (const ct of chiTiet) {
      let MaCTNH = genMaCTNH();
      let [chk] = await conn.query("SELECT MaCTNH FROM CT_NHAP_HANG WHERE MaCTNH = ?", [MaCTNH]);
      while (chk.length > 0) {
        MaCTNH = genMaCTNH();
        [chk] = await conn.query("SELECT MaCTNH FROM CT_NHAP_HANG WHERE MaCTNH = ?", [MaCTNH]);
      }
      await conn.query(
        "INSERT INTO CT_NHAP_HANG (MaCTNH, MaNH, MaSP, SoLuong, DonGiaNhap) VALUES (?, ?, ?, ?, ?)",
        [MaCTNH, MaNH, ct.MaSP, ct.SoLuong, ct.DonGiaNhap]
      );
      // Cập nhật tồn kho
      await conn.query(
        "UPDATE SAN_PHAM SET TonKho = TonKho + ? WHERE MaSP = ?",
        [ct.SoLuong, ct.MaSP]
      );
    }

    await conn.commit();
    res.status(201).json({ message: "Tạo phiếu nhập hàng thành công", MaNH });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ message: "Lỗi tạo phiếu nhập hàng", error: err.message });
  } finally {
    conn.release();
  }
};

/**
 * DELETE /api/admin/nhap-hang/:id
 */
export const deleteNhapHang = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Hoàn lại tồn kho
    const [chiTiet] = await conn.query("SELECT MaSP, SoLuong FROM CT_NHAP_HANG WHERE MaNH = ?", [req.params.id]);
    for (const ct of chiTiet) {
      await conn.query("UPDATE SAN_PHAM SET TonKho = TonKho - ? WHERE MaSP = ?", [ct.SoLuong, ct.MaSP]);
    }

    await conn.query("DELETE FROM CT_NHAP_HANG WHERE MaNH = ?", [req.params.id]);
    await conn.query("DELETE FROM PHIEU_NHAP_HANG WHERE MaNH = ?", [req.params.id]);

    await conn.commit();
    res.json({ message: "Xóa phiếu nhập hàng thành công" });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ message: "Lỗi xóa phiếu nhập hàng", error: err.message });
  } finally {
    conn.release();
  }
};

/**
 * GET /api/admin/nhap-hang/stats - Thống kê nhập hàng
 */
export const getNhapHangStats = async (req, res) => {
  try {
    const [[thangNay]] = await pool.query(
      `SELECT COUNT(*) AS soPhieu, COALESCE(SUM(TongTien),0) AS tongTien
       FROM PHIEU_NHAP_HANG
       WHERE MONTH(NgayNhap)=MONTH(NOW()) AND YEAR(NgayNhap)=YEAR(NOW())`
    );
    const [topSP] = await pool.query(
      `SELECT sp.TenSP, SUM(ct.SoLuong) AS TongNhap
       FROM CT_NHAP_HANG ct
       LEFT JOIN SAN_PHAM sp ON ct.MaSP = sp.MaSP
       WHERE MONTH(ct.MaNH IN (SELECT MaNH FROM PHIEU_NHAP_HANG WHERE MONTH(NgayNhap)=MONTH(NOW()) AND YEAR(NgayNhap)=YEAR(NOW())))
       GROUP BY ct.MaSP ORDER BY TongNhap DESC LIMIT 5`
    );
    res.json({ thangNay, topSP });
  } catch (err) {
    res.status(500).json({ message: "Lỗi thống kê", error: err.message });
  }
};
