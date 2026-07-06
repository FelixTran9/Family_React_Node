import pool from "../config/db.js";

/**
 * GET /api/admin/cau-hinh-canh-bao
 */
export const getCauHinhList = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT c.*, d.TenDanhMuc
       FROM CAU_HINH_CANH_BAO c
       LEFT JOIN DANH_MUC_SP d ON c.MaDanhMuc = d.MaDanhMuc
       ORDER BY c.MaDanhMuc IS NULL DESC, d.TenDanhMuc ASC`
    );
    res.json({ data: rows });
  } catch (err) {
    res.status(500).json({ message: "Lỗi lấy cấu hình cảnh báo", error: err.message });
  }
};

/**
 * GET /api/admin/cau-hinh-canh-bao/:id
 */
export const getCauHinhById = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM CAU_HINH_CANH_BAO WHERE MaCauHinh = ?", [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: "Không tìm thấy cấu hình" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Lỗi lấy cấu hình cảnh báo", error: err.message });
  }
};

/**
 * POST /api/admin/cau-hinh-canh-bao
 */
export const createCauHinh = async (req, res) => {
  const { MaDanhMuc, NguongTonKhoLau, NguongSapHetHan, NguongTonKhoThap, KichHoat } = req.body;
  try {
    // Kiểm tra không trùng danh mục
    const checkField = MaDanhMuc ? "MaDanhMuc = ?" : "MaDanhMuc IS NULL";
    const checkParam = MaDanhMuc ? [MaDanhMuc] : [];
    const [existing] = await pool.query(`SELECT MaCauHinh FROM CAU_HINH_CANH_BAO WHERE ${checkField}`, checkParam);
    if (existing.length > 0) {
      return res.status(409).json({ message: MaDanhMuc ? "Danh mục này đã có cấu hình" : "Cấu hình mặc định đã tồn tại" });
    }

    await pool.query(
      `INSERT INTO CAU_HINH_CANH_BAO (MaDanhMuc, NguongTonKhoLau, NguongSapHetHan, NguongTonKhoThap, KichHoat)
       VALUES (?, ?, ?, ?, ?)`,
      [MaDanhMuc || null, NguongTonKhoLau || 90, NguongSapHetHan || 30, NguongTonKhoThap || 10, KichHoat ?? 1]
    );
    res.status(201).json({ message: "Tạo cấu hình cảnh báo thành công" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi tạo cấu hình cảnh báo", error: err.message });
  }
};

/**
 * PUT /api/admin/cau-hinh-canh-bao/:id
 */
export const updateCauHinh = async (req, res) => {
  const { NguongTonKhoLau, NguongSapHetHan, NguongTonKhoThap, KichHoat } = req.body;
  try {
    await pool.query(
      "UPDATE CAU_HINH_CANH_BAO SET NguongTonKhoLau=?, NguongSapHetHan=?, NguongTonKhoThap=?, KichHoat=? WHERE MaCauHinh=?",
      [NguongTonKhoLau, NguongSapHetHan, NguongTonKhoThap, KichHoat ?? 1, req.params.id]
    );
    res.json({ message: "Cập nhật cấu hình cảnh báo thành công" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi cập nhật cấu hình cảnh báo", error: err.message });
  }
};

/**
 * DELETE /api/admin/cau-hinh-canh-bao/:id
 */
export const deleteCauHinh = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT MaDanhMuc FROM CAU_HINH_CANH_BAO WHERE MaCauHinh = ?", [req.params.id]);
    if (rows.length > 0 && rows[0].MaDanhMuc === null) {
      return res.status(400).json({ message: "Không thể xóa cấu hình mặc định" });
    }
    await pool.query("DELETE FROM CAU_HINH_CANH_BAO WHERE MaCauHinh=?", [req.params.id]);
    res.json({ message: "Xóa cấu hình cảnh báo thành công" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi xóa cấu hình cảnh báo", error: err.message });
  }
};
