import pool from "../config/db.js";
import { quetCanhBaoTonKho } from "../services/tonKhoService.js";

/**
 * GET /api/admin/canh-bao-ton-kho
 */
export const getCanhBaoList = async (req, res) => {
  const { loai = "", trangThai = "", page = 1, limit = 15 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);
  try {
    let where = "WHERE 1=1";
    const params = [];
    if (loai) { where += " AND cb.LoaiCanhBao = ?"; params.push(loai); }
    if (trangThai) { where += " AND cb.TrangThai = ?"; params.push(trangThai); }

    const [rows] = await pool.query(
      `SELECT cb.*, sp.TenSP, sp.TonKho, sp.DonViTinh
       FROM CANH_BAO_TON_KHO cb
       LEFT JOIN SAN_PHAM sp ON cb.MaSP = sp.MaSP
       ${where}
       ORDER BY cb.MucDoUuTien DESC, cb.NgayCanhBao DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM CANH_BAO_TON_KHO cb ${where}`,
      params
    );

    res.json({ data: rows, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    res.status(500).json({ message: "Lỗi lấy danh sách cảnh báo tồn kho", error: err.message });
  }
};

/**
 * GET /api/admin/canh-bao-ton-kho/:id
 */
export const getCanhBaoById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT cb.*, sp.TenSP, sp.TonKho, sp.DonViTinh
       FROM CANH_BAO_TON_KHO cb
       LEFT JOIN SAN_PHAM sp ON cb.MaSP = sp.MaSP
       WHERE cb.MaCanhBao = ?`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: "Không tìm thấy cảnh báo" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Lỗi lấy cảnh báo tồn kho", error: err.message });
  }
};

/**
 * PATCH /api/admin/canh-bao-ton-kho/:id/xu-ly
 */
export const xuLyCanhBao = async (req, res) => {
  const { TrangThai, GhiChuXuLy, NguoiXuLy } = req.body;
  const trangThaiHopLe = ["dang_xu_ly", "da_xu_ly", "bo_qua"];
  if (!TrangThai || !trangThaiHopLe.includes(TrangThai)) {
    return res.status(400).json({ message: `TrangThai phải là một trong: ${trangThaiHopLe.join(", ")}` });
  }
  try {
    await pool.query(
      "UPDATE CANH_BAO_TON_KHO SET TrangThai=?, GhiChuXuLy=?, NguoiXuLy=?, NgayXuLy=NOW() WHERE MaCanhBao=?",
      [TrangThai, GhiChuXuLy || null, NguoiXuLy || null, req.params.id]
    );
    res.json({ message: "Cập nhật trạng thái xử lý thành công" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi cập nhật cảnh báo", error: err.message });
  }
};

/**
 * POST /api/admin/canh-bao-ton-kho/quet
 * Chạy quét thủ công
 */
export const quetCanhBao = async (req, res) => {
  try {
    const ketQua = await quetCanhBaoTonKho();
    res.json({ message: "Quét cảnh báo tồn kho thành công", ...ketQua });
  } catch (err) {
    res.status(500).json({ message: "Lỗi quét cảnh báo tồn kho", error: err.message });
  }
};

/**
 * GET /api/admin/canh-bao-ton-kho/thong-ke
 */
export const thongKeCanhBao = async (req, res) => {
  try {
    const [tongHop] = await pool.query(
      `SELECT
         COUNT(*) AS tong,
         SUM(CASE WHEN TrangThai = 'chua_xu_ly' THEN 1 ELSE 0 END) AS chuaXuLy,
         SUM(CASE WHEN LoaiCanhBao = 'ton_kho_lau' THEN 1 ELSE 0 END) AS tonKhoLau,
         SUM(CASE WHEN LoaiCanhBao = 'sap_het_han' THEN 1 ELSE 0 END) AS sapHetHan,
         SUM(CASE WHEN LoaiCanhBao = 'da_het_han' THEN 1 ELSE 0 END) AS daHetHan,
         SUM(CASE WHEN MucDoUuTien = 4 AND TrangThai = 'chua_xu_ly' THEN 1 ELSE 0 END) AS khanCap
       FROM CANH_BAO_TON_KHO`
    );
    res.json(tongHop[0]);
  } catch (err) {
    res.status(500).json({ message: "Lỗi thống kê cảnh báo", error: err.message });
  }
};
