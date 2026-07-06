import pool from "../config/db.js";

/**
 * GET /api/admin/cham-soc
 */
export const getChamSocList = async (req, res) => {
  const { maKH = "", page = 1, limit = 15 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);
  try {
    let where = "WHERE 1=1";
    const params = [];
    if (maKH) { where += " AND cs.MaKH = ?"; params.push(maKH); }

    const [rows] = await pool.query(
      `SELECT cs.*, kh.TenKH, kh.SDT, kh.Email,
              nv.TenNV AS TenNguoiThucHien
       FROM CHAM_SOC_KHACH_HANG cs
       LEFT JOIN KHACH_HANG kh ON cs.MaKH = kh.MaKH
       LEFT JOIN NHAN_VIEN nv ON cs.NguoiThucHien = nv.MaNV
       ${where}
       ORDER BY cs.NgayThucHien DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM CHAM_SOC_KHACH_HANG cs ${where}`,
      params
    );

    res.json({ data: rows, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    res.status(500).json({ message: "Lỗi lấy danh sách chăm sóc khách hàng", error: err.message });
  }
};

/**
 * GET /api/admin/cham-soc/:id
 */
export const getChamSocById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT cs.*, kh.TenKH, nv.TenNV AS TenNguoiThucHien
       FROM CHAM_SOC_KHACH_HANG cs
       LEFT JOIN KHACH_HANG kh ON cs.MaKH = kh.MaKH
       LEFT JOIN NHAN_VIEN nv ON cs.NguoiThucHien = nv.MaNV
       WHERE cs.MaCSKH = ?`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: "Không tìm thấy bản ghi chăm sóc" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Lỗi lấy bản ghi chăm sóc", error: err.message });
  }
};

/**
 * POST /api/admin/cham-soc
 */
export const createChamSoc = async (req, res) => {
  const { MaKH, LoaiTuongTac, NguoiThucHien, NoiDung, KetQua, MaDon_LienQuan, GhiChu } = req.body;
  if (!MaKH || !LoaiTuongTac) {
    return res.status(400).json({ message: "MaKH và LoaiTuongTac là bắt buộc" });
  }
  const loaiHopLe = ["goi_dien", "email", "tang_qua", "uu_dai_rieng", "chuc_mung"];
  if (!loaiHopLe.includes(LoaiTuongTac)) {
    return res.status(400).json({ message: `LoaiTuongTac phải là: ${loaiHopLe.join(", ")}` });
  }
  try {
    const [result] = await pool.query(
      `INSERT INTO CHAM_SOC_KHACH_HANG (MaKH, LoaiTuongTac, NguoiThucHien, NoiDung, KetQua, MaDon_LienQuan, GhiChu)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [MaKH, LoaiTuongTac, NguoiThucHien || null, NoiDung || null, KetQua || null, MaDon_LienQuan || null, GhiChu || null]
    );
    res.status(201).json({ message: "Tạo bản ghi chăm sóc thành công", MaCSKH: result.insertId });
  } catch (err) {
    res.status(500).json({ message: "Lỗi tạo bản ghi chăm sóc", error: err.message });
  }
};

/**
 * PUT /api/admin/cham-soc/:id
 */
export const updateChamSoc = async (req, res) => {
  const { LoaiTuongTac, NguoiThucHien, NoiDung, KetQua, GhiChu } = req.body;
  try {
    await pool.query(
      "UPDATE CHAM_SOC_KHACH_HANG SET LoaiTuongTac=?, NguoiThucHien=?, NoiDung=?, KetQua=?, GhiChu=? WHERE MaCSKH=?",
      [LoaiTuongTac, NguoiThucHien || null, NoiDung || null, KetQua || null, GhiChu || null, req.params.id]
    );
    res.json({ message: "Cập nhật bản ghi chăm sóc thành công" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi cập nhật bản ghi chăm sóc", error: err.message });
  }
};

/**
 * DELETE /api/admin/cham-soc/:id
 */
export const deleteChamSoc = async (req, res) => {
  try {
    await pool.query("DELETE FROM CHAM_SOC_KHACH_HANG WHERE MaCSKH=?", [req.params.id]);
    res.json({ message: "Xóa bản ghi chăm sóc thành công" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi xóa bản ghi chăm sóc", error: err.message });
  }
};
