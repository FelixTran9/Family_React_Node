import crypto from "crypto";
import pool from "../config/db.js";

const genMaCC = () => "CC" + crypto.randomBytes(3).toString("hex").toUpperCase();
const genMaBL = () => "BL" + crypto.randomBytes(3).toString("hex").toUpperCase();

// ===================== CHẤM CÔNG =====================

/**
 * GET /api/admin/cham-cong?thang=4&nam=2026&maNV=
 */
export const getChamCong = async (req, res) => {
  const { thang, nam, maNV = "", page = 1, limit = 20 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);
  try {
    let where = "WHERE 1=1";
    const params = [];
    if (thang) { where += " AND MONTH(cc.NgayLam) = ?"; params.push(thang); }
    if (nam)   { where += " AND YEAR(cc.NgayLam) = ?";  params.push(nam);   }
    if (maNV)  { where += " AND cc.MaNV = ?";           params.push(maNV);  }

    const [rows] = await pool.query(
      `SELECT cc.MaCC, cc.MaNV, cc.NgayLam, cc.GioVao, cc.GioRa,
              cc.SoGioLam, cc.TrangThai, cc.GhiChu,
              nv.TenNV, nv.TaiKhoan
       FROM CHAM_CONG cc
       LEFT JOIN NHAN_VIEN nv ON cc.MaNV = nv.MaNV
       ${where}
       ORDER BY cc.NgayLam DESC, nv.TenNV
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM CHAM_CONG cc
       LEFT JOIN NHAN_VIEN nv ON cc.MaNV = nv.MaNV ${where}`,
      params
    );

    res.json({ data: rows, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    res.status(500).json({ message: "Lỗi lấy dữ liệu chấm công", error: err.message });
  }
};

/**
 * GET /api/admin/cham-cong/:id
 */
export const getChamCongById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT cc.*, nv.TenNV FROM CHAM_CONG cc
       LEFT JOIN NHAN_VIEN nv ON cc.MaNV = nv.MaNV
       WHERE cc.MaCC = ?`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: "Không tìm thấy bản ghi chấm công" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Lỗi", error: err.message });
  }
};

/**
 * POST /api/admin/cham-cong
 */
export const createChamCong = async (req, res) => {
  const { MaNV, NgayLam, GioVao, GioRa, TrangThai, GhiChu } = req.body;
  if (!MaNV || !NgayLam || !TrangThai) {
    return res.status(400).json({ message: "Thiếu thông tin bắt buộc (Nhân viên, Ngày làm, Trạng thái)" });
  }
  try {
    // Kiểm tra đã chấm công ngày đó chưa
    const [exists] = await pool.query(
      "SELECT MaCC FROM CHAM_CONG WHERE MaNV = ? AND NgayLam = ?",
      [MaNV, NgayLam]
    );
    if (exists.length > 0) {
      return res.status(400).json({ message: "Nhân viên này đã được chấm công cho ngày này" });
    }

    let MaCC = genMaCC();
    let [check] = await pool.query("SELECT MaCC FROM CHAM_CONG WHERE MaCC = ?", [MaCC]);
    while (check.length > 0) {
      MaCC = genMaCC();
      [check] = await pool.query("SELECT MaCC FROM CHAM_CONG WHERE MaCC = ?", [MaCC]);
    }

    // Tính số giờ làm
    let SoGioLam = 0;
    if (GioVao && GioRa) {
      const [h1, m1] = GioVao.split(":").map(Number);
      const [h2, m2] = GioRa.split(":").map(Number);
      SoGioLam = Math.max(0, (h2 * 60 + m2 - (h1 * 60 + m1)) / 60);
    } else if (TrangThai === "nghi_phep" || TrangThai === "vang_mat") {
      SoGioLam = 0;
    } else {
      SoGioLam = 8; // Mặc định 8h nếu không nhập giờ
    }

    await pool.query(
      `INSERT INTO CHAM_CONG (MaCC, MaNV, NgayLam, GioVao, GioRa, SoGioLam, TrangThai, GhiChu)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [MaCC, MaNV, NgayLam, GioVao || null, GioRa || null, SoGioLam, TrangThai, GhiChu || null]
    );
    res.status(201).json({ message: "Chấm công thành công", MaCC });
  } catch (err) {
    res.status(500).json({ message: "Lỗi chấm công", error: err.message });
  }
};

/**
 * PUT /api/admin/cham-cong/:id
 */
export const updateChamCong = async (req, res) => {
  const { GioVao, GioRa, TrangThai, GhiChu } = req.body;
  if (!TrangThai) return res.status(400).json({ message: "Thiếu trạng thái" });
  try {
    let SoGioLam = 0;
    if (GioVao && GioRa) {
      const [h1, m1] = GioVao.split(":").map(Number);
      const [h2, m2] = GioRa.split(":").map(Number);
      SoGioLam = Math.max(0, (h2 * 60 + m2 - (h1 * 60 + m1)) / 60);
    } else if (TrangThai === "di_lam") {
      SoGioLam = 8;
    }

    await pool.query(
      `UPDATE CHAM_CONG SET GioVao=?, GioRa=?, SoGioLam=?, TrangThai=?, GhiChu=? WHERE MaCC=?`,
      [GioVao || null, GioRa || null, SoGioLam, TrangThai, GhiChu || null, req.params.id]
    );
    res.json({ message: "Cập nhật chấm công thành công" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi cập nhật", error: err.message });
  }
};

/**
 * DELETE /api/admin/cham-cong/:id
 */
export const deleteChamCong = async (req, res) => {
  try {
    await pool.query("DELETE FROM CHAM_CONG WHERE MaCC = ?", [req.params.id]);
    res.json({ message: "Đã xóa bản ghi chấm công" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi xóa", error: err.message });
  }
};

// ===================== BẢNG LƯƠNG =====================

/**
 * GET /api/admin/bang-luong?thang=4&nam=2026
 */
export const getBangLuong = async (req, res) => {
  const { thang, nam, maNV = "", page = 1, limit = 20 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);
  try {
    let where = "WHERE 1=1";
    const params = [];
    if (thang) { where += " AND bl.Thang = ?"; params.push(thang); }
    if (nam)   { where += " AND bl.Nam = ?";   params.push(nam);   }
    if (maNV)  { where += " AND bl.MaNV = ?";  params.push(maNV); }

    const [rows] = await pool.query(
      `SELECT bl.MaBL, bl.MaNV, bl.Thang, bl.Nam,
              bl.SoNgayLam, bl.SoGioLam, bl.LuongCoBan,
              bl.PhuCap, bl.KhauTru, bl.TongLuong, bl.TrangThai, bl.GhiChu,
              nv.TenNV, nv.TaiKhoan
       FROM BANG_LUONG bl
       LEFT JOIN NHAN_VIEN nv ON bl.MaNV = nv.MaNV
       ${where}
       ORDER BY bl.Nam DESC, bl.Thang DESC, nv.TenNV
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM BANG_LUONG bl
       LEFT JOIN NHAN_VIEN nv ON bl.MaNV = nv.MaNV ${where}`,
      params
    );

    res.json({ data: rows, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    res.status(500).json({ message: "Lỗi lấy bảng lương", error: err.message });
  }
};

/**
 * GET /api/admin/bang-luong/:id
 */
export const getBangLuongById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT bl.*, nv.TenNV FROM BANG_LUONG bl
       LEFT JOIN NHAN_VIEN nv ON bl.MaNV = nv.MaNV
       WHERE bl.MaBL = ?`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: "Không tìm thấy bảng lương" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Lỗi", error: err.message });
  }
};

/**
 * POST /api/admin/bang-luong/tinh-luong — Tự động tính lương từ chấm công
 */
export const tinhLuong = async (req, res) => {
  const { Thang, Nam, LuongCoBanMacDinh, PhuCap = 0, KhauTru = 0 } = req.body;
  if (!Thang || !Nam || !LuongCoBanMacDinh) {
    return res.status(400).json({ message: "Thiếu thông tin: Tháng, Năm, Lương cơ bản" });
  }
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Lấy thống kê chấm công theo tháng
    const [chamCongData] = await conn.query(
      `SELECT cc.MaNV,
              COUNT(CASE WHEN cc.TrangThai = 'di_lam' THEN 1 END) AS SoNgayLam,
              SUM(cc.SoGioLam) AS TongGio
       FROM CHAM_CONG cc
       WHERE MONTH(cc.NgayLam) = ? AND YEAR(cc.NgayLam) = ?
       GROUP BY cc.MaNV`,
      [Thang, Nam]
    );

    if (chamCongData.length === 0) {
      await conn.rollback();
      return res.status(400).json({ message: "Không có dữ liệu chấm công cho tháng/năm này" });
    }

    let created = 0;
    let updated = 0;

    for (const cc of chamCongData) {
      const SoNgayLam = cc.SoNgayLam || 0;
      const SoGioLam = cc.TongGio || 0;
      // Công thức: Lương = (SoNgayLam / 26) * LuongCoBan + PhuCap - KhauTru
      const TongLuong = Math.round((SoNgayLam / 26) * LuongCoBanMacDinh + Number(PhuCap) - Number(KhauTru));

      const [existing] = await conn.query(
        "SELECT MaBL FROM BANG_LUONG WHERE MaNV = ? AND Thang = ? AND Nam = ?",
        [cc.MaNV, Thang, Nam]
      );

      if (existing.length > 0) {
        await conn.query(
          `UPDATE BANG_LUONG SET SoNgayLam=?, SoGioLam=?, LuongCoBan=?, PhuCap=?, KhauTru=?,
           TongLuong=?, TrangThai='chua_thanh_toan' WHERE MaBL=?`,
          [SoNgayLam, SoGioLam, LuongCoBanMacDinh, PhuCap, KhauTru, TongLuong, existing[0].MaBL]
        );
        updated++;
      } else {
        let MaBL = genMaBL();
        let [chk] = await conn.query("SELECT MaBL FROM BANG_LUONG WHERE MaBL = ?", [MaBL]);
        while (chk.length > 0) {
          MaBL = genMaBL();
          [chk] = await conn.query("SELECT MaBL FROM BANG_LUONG WHERE MaBL = ?", [MaBL]);
        }
        await conn.query(
          `INSERT INTO BANG_LUONG (MaBL, MaNV, Thang, Nam, SoNgayLam, SoGioLam, LuongCoBan, PhuCap, KhauTru, TongLuong, TrangThai)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'chua_thanh_toan')`,
          [MaBL, cc.MaNV, Thang, Nam, SoNgayLam, SoGioLam, LuongCoBanMacDinh, PhuCap, KhauTru, TongLuong]
        );
        created++;
      }
    }

    await conn.commit();
    res.status(201).json({ message: `Đã tính lương: ${created} mới, ${updated} cập nhật`, created, updated });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ message: "Lỗi tính lương", error: err.message });
  } finally {
    conn.release();
  }
};

/**
 * POST /api/admin/bang-luong — Tạo bảng lương thủ công
 */
export const createBangLuong = async (req, res) => {
  const { MaNV, Thang, Nam, SoNgayLam, SoGioLam, LuongCoBan, PhuCap = 0, KhauTru = 0, GhiChu } = req.body;
  if (!MaNV || !Thang || !Nam || LuongCoBan === undefined) {
    return res.status(400).json({ message: "Thiếu thông tin bắt buộc" });
  }
  try {
    const [existing] = await pool.query(
      "SELECT MaBL FROM BANG_LUONG WHERE MaNV = ? AND Thang = ? AND Nam = ?",
      [MaNV, Thang, Nam]
    );
    if (existing.length > 0) {
      return res.status(400).json({ message: "Nhân viên này đã có bảng lương tháng này. Hãy chỉnh sửa bảng lương hiện có." });
    }

    let MaBL = genMaBL();
    let [check] = await pool.query("SELECT MaBL FROM BANG_LUONG WHERE MaBL = ?", [MaBL]);
    while (check.length > 0) {
      MaBL = genMaBL();
      [check] = await pool.query("SELECT MaBL FROM BANG_LUONG WHERE MaBL = ?", [MaBL]);
    }

    const TongLuong = Math.round((Number(SoNgayLam || 0) / 26) * Number(LuongCoBan) + Number(PhuCap) - Number(KhauTru));

    await pool.query(
      `INSERT INTO BANG_LUONG (MaBL, MaNV, Thang, Nam, SoNgayLam, SoGioLam, LuongCoBan, PhuCap, KhauTru, TongLuong, TrangThai, GhiChu)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'chua_thanh_toan', ?)`,
      [MaBL, MaNV, Thang, Nam, SoNgayLam || 0, SoGioLam || 0, LuongCoBan, PhuCap, KhauTru, TongLuong, GhiChu || null]
    );
    res.status(201).json({ message: "Tạo bảng lương thành công", MaBL });
  } catch (err) {
    res.status(500).json({ message: "Lỗi tạo bảng lương", error: err.message });
  }
};

/**
 * PUT /api/admin/bang-luong/:id
 */
export const updateBangLuong = async (req, res) => {
  const { SoNgayLam, SoGioLam, LuongCoBan, PhuCap = 0, KhauTru = 0, TrangThai, GhiChu } = req.body;
  try {
    const TongLuong = Math.round((Number(SoNgayLam || 0) / 26) * Number(LuongCoBan) + Number(PhuCap) - Number(KhauTru));
    await pool.query(
      `UPDATE BANG_LUONG SET SoNgayLam=?, SoGioLam=?, LuongCoBan=?, PhuCap=?, KhauTru=?,
       TongLuong=?, TrangThai=?, GhiChu=? WHERE MaBL=?`,
      [SoNgayLam, SoGioLam, LuongCoBan, PhuCap, KhauTru, TongLuong, TrangThai, GhiChu || null, req.params.id]
    );
    res.json({ message: "Cập nhật bảng lương thành công" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi cập nhật bảng lương", error: err.message });
  }
};

/**
 * PATCH /api/admin/bang-luong/:id/thanh-toan
 */
export const thanhToanLuong = async (req, res) => {
  try {
    await pool.query(
      "UPDATE BANG_LUONG SET TrangThai='da_thanh_toan' WHERE MaBL = ?",
      [req.params.id]
    );
    res.json({ message: "Đã xác nhận thanh toán lương" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi xác nhận thanh toán", error: err.message });
  }
};

/**
 * DELETE /api/admin/bang-luong/:id
 */
export const deleteBangLuong = async (req, res) => {
  try {
    await pool.query("DELETE FROM BANG_LUONG WHERE MaBL = ?", [req.params.id]);
    res.json({ message: "Đã xóa bảng lương" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi xóa bảng lương", error: err.message });
  }
};
