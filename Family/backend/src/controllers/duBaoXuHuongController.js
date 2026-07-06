import pool from "../config/db.js";
import { duBaoXuHuong } from "../services/duBaoService.js";

/**
 * GET /api/admin/du-bao
 */
export const getDuBaoList = async (req, res) => {
  const { ky = "", xuHuong = "", page = 1, limit = 15 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);
  try {
    let where = "WHERE 1=1";
    const params = [];
    if (ky) { where += " AND db.KyDuBao = ?"; params.push(ky); }
    else {
      where += " AND db.KyDuBao = (SELECT MAX(KyDuBao) FROM DU_BAO_XU_HUONG)";
    }
    if (xuHuong) { where += " AND db.XuHuong = ?"; params.push(xuHuong); }

    const [rows] = await pool.query(
      `SELECT db.*, sp.TenSP, sp.TonKho, sp.DonViTinh, sp.GiaVon, sp.GiaBan, d.TenDanhMuc
       FROM DU_BAO_XU_HUONG db
       LEFT JOIN SAN_PHAM sp ON db.MaSP = sp.MaSP
       LEFT JOIN DANH_MUC_SP d ON sp.MaDanhMuc = d.MaDanhMuc
       ${where}
       ORDER BY db.DoTinCay DESC, db.SoLuongDuBao DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM DU_BAO_XU_HUONG db ${where}`,
      params
    );

    res.json({ data: rows, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    res.status(500).json({ message: "Lỗi lấy danh sách dự báo xu hướng", error: err.message });
  }
};

/**
 * GET /api/admin/du-bao/:id
 */
export const getDuBaoById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT db.*, sp.TenSP, sp.TonKho, sp.DonViTinh
       FROM DU_BAO_XU_HUONG db
       LEFT JOIN SAN_PHAM sp ON db.MaSP = sp.MaSP
       WHERE db.MaDuBao = ?`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: "Không tìm thấy dự báo" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Lỗi lấy dự báo", error: err.message });
  }
};

/**
 * POST /api/admin/du-bao/chay
 * Chạy dự báo thủ công
 */
export const chayDuBao = async (req, res) => {
  try {
    const ketQua = await duBaoXuHuong();
    res.json({ message: "Dự báo xu hướng thành công", ...ketQua });
  } catch (err) {
    res.status(500).json({ message: "Lỗi chạy dự báo xu hướng", error: err.message });
  }
};

/**
 * GET /api/admin/de-nghi-dat-hang
 */
export const getDeNghiList = async (req, res) => {
  const { trangThai = "", page = 1, limit = 15 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);
  try {
    let where = "WHERE 1=1";
    const params = [];
    if (trangThai) { where += " AND dn.TrangThai = ?"; params.push(trangThai); }

    const [rows] = await pool.query(
      `SELECT dn.*, sp.TenSP, sp.TonKho, sp.DonViTinh, sp.GiaVon,
              db.KyDuBao, db.XuHuong, db.DoTinCay, db.SoLuongDuBao
       FROM DE_NGHI_DAT_HANG_DU_BAO dn
       LEFT JOIN SAN_PHAM sp ON dn.MaSP = sp.MaSP
       LEFT JOIN DU_BAO_XU_HUONG db ON dn.MaDuBao = db.MaDuBao
       ${where}
       ORDER BY dn.NgayDeNghi DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM DE_NGHI_DAT_HANG_DU_BAO dn ${where}`,
      params
    );

    res.json({ data: rows, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    res.status(500).json({ message: "Lỗi lấy danh sách đề nghị đặt hàng", error: err.message });
  }
};

/**
 * PATCH /api/admin/de-nghi-dat-hang/:id
 * Duyệt / hủy đề nghị
 */
export const duyetDeNghi = async (req, res) => {
  const { TrangThai, NguoiDuyet } = req.body;
  const trangThaiHopLe = ["da_duyet", "da_dat_hang", "huy"];
  if (!TrangThai || !trangThaiHopLe.includes(TrangThai)) {
    return res.status(400).json({ message: `TrangThai phải là: ${trangThaiHopLe.join(", ")}` });
  }
  try {
    await pool.query(
      "UPDATE DE_NGHI_DAT_HANG_DU_BAO SET TrangThai=?, NguoiDuyet=?, NgayDuyet=NOW() WHERE MaDeNghi=?",
      [TrangThai, NguoiDuyet || null, req.params.id]
    );
    res.json({ message: "Cập nhật đề nghị đặt hàng thành công" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi cập nhật đề nghị", error: err.message });
  }
};

/**
 * GET /api/admin/du-bao/ky
 * Lấy danh sách các kỳ dự báo đã có
 */
export const getDanhSachKyDuBao = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT KyDuBao,
              COUNT(*) AS soSanPham,
              SUM(CASE WHEN XuHuong IN ('tang', 'tang_manh') THEN 1 ELSE 0 END) AS soTang,
              SUM(CASE WHEN XuHuong IN ('giam', 'giam_manh') THEN 1 ELSE 0 END) AS soGiam,
              SUM(DeNghiNhapThem) AS tongDeNghiNhap,
              MAX(NgayDuBao) AS ngayDuBao
       FROM DU_BAO_XU_HUONG
       GROUP BY KyDuBao
       ORDER BY KyDuBao DESC`
    );
    res.json({ data: rows });
  } catch (err) {
    res.status(500).json({ message: "Lỗi lấy danh sách kỳ dự báo", error: err.message });
  }
};
