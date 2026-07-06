import crypto from "crypto";
import pool from "../config/db.js";

const genMaLo = () => "LO" + crypto.randomBytes(4).toString("hex").toUpperCase();

/**
 * GET /api/admin/lo-hang
 */
export const getLoHangList = async (req, res) => {
  const { maSP = "", trangThai = "", page = 1, limit = 15 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);
  try {
    let where = "WHERE 1=1";
    const params = [];
    if (maSP) { where += " AND lh.MaSP = ?"; params.push(maSP); }
    if (trangThai === "con_hang") { where += " AND lh.SoLuongConLai > 0"; }
    if (trangThai === "het_hang") { where += " AND lh.SoLuongConLai = 0"; }
    if (trangThai === "het_han") { where += " AND lh.HanSuDung < CURDATE()"; }
    if (trangThai === "sap_het_han") { where += " AND lh.HanSuDung BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY)"; }

    const [rows] = await pool.query(
      `SELECT lh.*, sp.TenSP, sp.DonViTinh,
              nh.NgayNhap, ncc.TenNCC,
              DATEDIFF(NOW(), lh.NgayNhapKho) AS SoNgayTonKho,
              DATEDIFF(lh.HanSuDung, CURDATE()) AS SoNgayConLaiHSD
       FROM LO_HANG lh
       LEFT JOIN SAN_PHAM sp ON lh.MaSP = sp.MaSP
       LEFT JOIN PHIEU_NHAP_HANG nh ON lh.MaNH = nh.MaNH
       LEFT JOIN NHA_CUNG_CAP ncc ON nh.MaNCC = ncc.MaNCC
       ${where}
       ORDER BY lh.NgayNhapKho DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM LO_HANG lh ${where}`,
      params
    );

    res.json({ data: rows, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    res.status(500).json({ message: "Lỗi lấy danh sách lô hàng", error: err.message });
  }
};

/**
 * GET /api/admin/lo-hang/:id
 */
export const getLoHangById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT lh.*, sp.TenSP, sp.DonViTinh, nh.NgayNhap, ncc.TenNCC
       FROM LO_HANG lh
       LEFT JOIN SAN_PHAM sp ON lh.MaSP = sp.MaSP
       LEFT JOIN PHIEU_NHAP_HANG nh ON lh.MaNH = nh.MaNH
       LEFT JOIN NHA_CUNG_CAP ncc ON nh.MaNCC = ncc.MaNCC
       WHERE lh.MaLo = ?`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: "Không tìm thấy lô hàng" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Lỗi lấy lô hàng", error: err.message });
  }
};

/**
 * PUT /api/admin/lo-hang/:id — Cập nhật hạn sử dụng / vị trí kho
 */
export const updateLoHang = async (req, res) => {
  const { HanSuDung, ViTriKho, GhiChu } = req.body;
  try {
    await pool.query(
      "UPDATE LO_HANG SET HanSuDung=?, ViTriKho=?, GhiChu=? WHERE MaLo=?",
      [HanSuDung || null, ViTriKho || null, GhiChu || null, req.params.id]
    );
    res.json({ message: "Cập nhật lô hàng thành công" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi cập nhật lô hàng", error: err.message });
  }
};
