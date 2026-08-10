import pool from "../config/db.js";

/**
 * GET /api/admin/nhat-ky-ai
 */
export const getNhatKyList = async (req, res) => {
  const { chucNang = "", trangThai = "", page = 1, limit = 20 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);
  try {
    let where = "WHERE 1=1";
    const params = [];
    if (chucNang) { where += " AND ChucNang = ?"; params.push(chucNang); }
    if (trangThai) { where += " AND TrangThai = ?"; params.push(trangThai); }

    const [rows] = await pool.query(
      `SELECT * FROM NHAT_KY_AI ${where}
       ORDER BY ThoiGianChay DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM NHAT_KY_AI ${where}`,
      params
    );

    res.json({ data: rows, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    res.status(500).json({ message: "Lỗi lấy nhật ký AI", error: err.message });
  }
};

/**
 * GET /api/admin/nhat-ky-ai/:id
 */
export const getNhatKyById = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM NHAT_KY_AI WHERE MaNhatKy = ?", [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: "Không tìm thấy nhật ký" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Lỗi lấy nhật ký AI", error: err.message });
  }
};

/**
 * GET /api/admin/nhat-ky-ai/thong-ke
 * Thống kê lần chạy gần nhất của mỗi chức năng
 */
export const thongKeNhatKy = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT
         ChucNang,
         COUNT(*) AS soLanChay,
         SUM(CASE WHEN TrangThai = 'thanh_cong' THEN 1 ELSE 0 END) AS thanhCong,
         SUM(CASE WHEN TrangThai = 'loi' THEN 1 ELSE 0 END) AS loi,
         MAX(ThoiGianChay) AS lanCuoiChay,
         AVG(ThoiGianChay_ms) AS tgTrungBinh_ms
       FROM NHAT_KY_AI
       GROUP BY ChucNang`
    );
    res.json({ data: rows });
  } catch (err) {
    res.status(500).json({ message: "Lỗi thống kê nhật ký AI", error: err.message });
  }
};
