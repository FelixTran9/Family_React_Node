import pool from "../config/db.js";
import { tinhRFM } from "../services/rfmService.js";

/**
 * GET /api/admin/khach-hang-vip
 * ?hang=KimCuong|Vang|Bac|Dong&ky=2026-07&page=1&limit=15
 */
export const getKhachHangVip = async (req, res) => {
  const { hang = "", ky = "", page = 1, limit = 15 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);
  try {
    let where = "WHERE 1=1";
    const params = [];
    if (hang) { where += " AND pl.HangKH = ?"; params.push(hang); }
    if (ky) { where += " AND pl.KyPhanTich = ?"; params.push(ky); }
    else {
      // Mặc định lấy kỳ mới nhất
      where += " AND pl.KyPhanTich = (SELECT MAX(KyPhanTich) FROM PHAN_LOAI_KHACH_HANG)";
    }

    const [rows] = await pool.query(
      `SELECT pl.*, kh.TenKH, kh.SDT, kh.Email, kh.DiaChi
       FROM PHAN_LOAI_KHACH_HANG pl
       JOIN KHACH_HANG kh ON pl.MaKH = kh.MaKH
       ${where}
       ORDER BY pl.DiemRFM DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM PHAN_LOAI_KHACH_HANG pl ${where}`,
      params
    );

    res.json({ data: rows, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    res.status(500).json({ message: "Lỗi lấy danh sách khách hàng VIP", error: err.message });
  }
};

/**
 * POST /api/admin/phan-loai-khach-hang/chay
 * Chạy phân tích RFM thủ công
 */
export const chayPhanLoaiRFM = async (req, res) => {
  try {
    const ketQua = await tinhRFM();
    res.json({ message: "Phân tích RFM thành công", ...ketQua });
  } catch (err) {
    res.status(500).json({ message: "Lỗi phân tích RFM", error: err.message });
  }
};

/**
 * GET /api/admin/phan-loai-khach-hang/ky
 * Lấy danh sách các kỳ phân tích đã có
 */
export const getDanhSachKy = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT KyPhanTich,
              COUNT(*) AS soKhach,
              SUM(CASE WHEN HangKH = 'KimCuong' THEN 1 ELSE 0 END) AS kimCuong,
              SUM(CASE WHEN HangKH = 'Vang' THEN 1 ELSE 0 END) AS vang,
              SUM(CASE WHEN HangKH = 'Bac' THEN 1 ELSE 0 END) AS bac,
              SUM(CASE WHEN HangKH = 'Dong' THEN 1 ELSE 0 END) AS dong,
              MAX(NgayPhanLoai) AS ngayChay
       FROM PHAN_LOAI_KHACH_HANG
       GROUP BY KyPhanTich
       ORDER BY KyPhanTich DESC`
    );
    res.json({ data: rows });
  } catch (err) {
    res.status(500).json({ message: "Lỗi lấy danh sách kỳ phân tích", error: err.message });
  }
};

/**
 * GET /api/admin/phan-loai-khach-hang/khach/:maKH
 * Xem lịch sử phân loại của 1 khách hàng
 */
export const getLichSuKhach = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT pl.*, kh.TenKH
       FROM PHAN_LOAI_KHACH_HANG pl
       JOIN KHACH_HANG kh ON pl.MaKH = kh.MaKH
       WHERE pl.MaKH = ?
       ORDER BY pl.KyPhanTich DESC`,
      [req.params.maKH]
    );
    res.json({ data: rows });
  } catch (err) {
    res.status(500).json({ message: "Lỗi lấy lịch sử phân loại", error: err.message });
  }
};
