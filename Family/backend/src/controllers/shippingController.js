import crypto from "crypto";
import pool from "../config/db.js";

// Bảng PHIEU_GIAO_HANG: MaPhieuGiao, NgayGiao, MaVanDon, TenNguoiNhan,
// SDTNguoiNhan, DiaChiGiao, TenShipper, TrangThaiGiao, GhiChu, MaDon, NguoiGiao

const genMaPhieuGiao = () => "PG" + crypto.randomBytes(4).toString("hex").toUpperCase();

/**
 * GET /api/admin/shipping?q=...&page=1&limit=15
 */
export const getShipping = async (req, res) => {
  const { q = "", page = 1, limit = 15 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);
  const search = `%${q}%`;
  try {
    const [rows] = await pool.query(
      `SELECT pgh.MaPhieuGiao, pgh.MaDon, pgh.NgayGiao, pgh.DiaChiGiao,
              pgh.TrangThaiGiao, pgh.TenNguoiNhan, pgh.SDTNguoiNhan,
              pgh.MaVanDon, pgh.TenShipper, pgh.GhiChu, pgh.NguoiGiao
       FROM PHIEU_GIAO_HANG pgh
       WHERE pgh.MaPhieuGiao LIKE ? OR pgh.MaDon LIKE ? OR pgh.TenNguoiNhan LIKE ?
       ORDER BY pgh.MaPhieuGiao DESC
       LIMIT ? OFFSET ?`,
      [search, search, search, parseInt(limit), offset]
    );
    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM PHIEU_GIAO_HANG
       WHERE MaPhieuGiao LIKE ? OR MaDon LIKE ? OR TenNguoiNhan LIKE ?`,
      [search, search, search]
    );
    res.json({ data: rows, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    res.status(500).json({ message: "Lỗi lấy danh sách giao hàng", error: err.message });
  }
};

/**
 * GET /api/admin/shipping/order-options — đơn hàng đã xác nhận để dropdown
 */
export const getOrderOptions = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT d.MaDon, d.TrangThai, kh.TenKH, kh.SDT, kh.DiaChi, d.TongThanhToan, d.NgayDat
       FROM DON_BAN_HANG d
       LEFT JOIN KHACH_HANG kh ON d.MaKH = kh.MaKH
       WHERE d.TrangThai = 'đã_xác_nhận'
       ORDER BY d.NgayDat DESC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Lỗi lấy danh sách đơn", error: err.message });
  }
};

/**
 * GET /api/admin/shipping/:id
 */
export const getShippingById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM PHIEU_GIAO_HANG WHERE MaPhieuGiao = ?",
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: "Không tìm thấy phiếu giao" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Lỗi lấy phiếu giao", error: err.message });
  }
};

/**
 * POST /api/admin/shipping
 */
export const createShipping = async (req, res) => {
  const { MaDon, NgayGiao, DiaChiGiao, TenNguoiNhan, SDTNguoiNhan, MaVanDon, TenShipper, GhiChu, NguoiGiao } = req.body;
  if (!MaDon || !DiaChiGiao || !TenNguoiNhan) {
    return res.status(400).json({ message: "Thiếu thông tin bắt buộc (MaDon, DiaChiGiao, TenNguoiNhan)" });
  }
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    let MaPhieuGiao = genMaPhieuGiao();
    let [check] = await conn.query("SELECT MaPhieuGiao FROM PHIEU_GIAO_HANG WHERE MaPhieuGiao = ?", [MaPhieuGiao]);
    while (check.length > 0) {
      MaPhieuGiao = genMaPhieuGiao();
      [check] = await conn.query("SELECT MaPhieuGiao FROM PHIEU_GIAO_HANG WHERE MaPhieuGiao = ?", [MaPhieuGiao]);
    }
    await conn.query(
      `INSERT INTO PHIEU_GIAO_HANG
         (MaPhieuGiao, MaDon, NgayGiao, DiaChiGiao, TenNguoiNhan, SDTNguoiNhan, MaVanDon, TenShipper, GhiChu, NguoiGiao, TrangThaiGiao)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'đang_giao')`,
      [MaPhieuGiao, MaDon, NgayGiao || null, DiaChiGiao, TenNguoiNhan, SDTNguoiNhan || null, MaVanDon || null, TenShipper || null, GhiChu || null, NguoiGiao || null]
    );

    // Cập nhật trạng thái đơn hàng thành đang giao
    await conn.query("UPDATE DON_BAN_HANG SET TrangThai = 'đang_giao' WHERE MaDon = ?", [MaDon]);

    await conn.commit();
    res.status(201).json({ message: "Tạo phiếu giao hàng thành công", MaPhieuGiao });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ message: "Lỗi tạo phiếu giao", error: err.message });
  } finally {
    conn.release();
  }
};

/**
 * PUT /api/admin/shipping/:id
 */
export const updateShipping = async (req, res) => {
  const { NgayGiao, DiaChiGiao, TenNguoiNhan, SDTNguoiNhan, MaVanDon, TenShipper, GhiChu, NguoiGiao, TrangThaiGiao } = req.body;
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Kiểm tra trạng thái cũ
    const [[phieu]] = await conn.query("SELECT TrangThaiGiao, MaDon FROM PHIEU_GIAO_HANG WHERE MaPhieuGiao = ?", [req.params.id]);
    if (!phieu) {
      await conn.rollback();
      return res.status(404).json({ message: "Không tìm thấy phiếu giao" });
    }

    const currentStatus = phieu.TrangThaiGiao;
    
    // Ngăn chặn lùi trạng thái hoặc đổi trạng thái khi đã chốt
    if (currentStatus !== "đang_giao" && currentStatus !== TrangThaiGiao) {
      await conn.rollback();
      return res.status(400).json({ message: "Phiếu đã kết thúc (đã giao/thất bại), không thể chuyển trạng thái khác!" });
    }

    await conn.query(
      `UPDATE PHIEU_GIAO_HANG
       SET NgayGiao=?, DiaChiGiao=?, TenNguoiNhan=?, SDTNguoiNhan=?,
           MaVanDon=?, TenShipper=?, GhiChu=?, NguoiGiao=?, TrangThaiGiao=?
       WHERE MaPhieuGiao=?`,
      [NgayGiao || null, DiaChiGiao, TenNguoiNhan, SDTNguoiNhan || null, MaVanDon || null, TenShipper || null, GhiChu || null, NguoiGiao || null, TrangThaiGiao, req.params.id]
    );

    // Đồng bộ với Đơn Bán Hàng nếu TrangThaiGiao thay đổi
    if (currentStatus !== TrangThaiGiao) {
      if (TrangThaiGiao === "đã_giao") {
        await conn.query("UPDATE DON_BAN_HANG SET TrangThai = 'đã_giao' WHERE MaDon = ?", [phieu.MaDon]);
      } else if (TrangThaiGiao === "giao_thất_bại") {
        // Giao thất bại thì đơn có thể bị hủy
        await conn.query("UPDATE DON_BAN_HANG SET TrangThai = 'đã_hủy' WHERE MaDon = ?", [phieu.MaDon]);
        
        // Hoàn kho nếu hủy (Tương tự logic OrderController)
        const [chiTiet] = await conn.query("SELECT MaSP, SoLuong FROM CT_DON_BAN WHERE MaDon = ?", [phieu.MaDon]);
        for (const ct of chiTiet) {
          await conn.query("UPDATE SAN_PHAM SET TonKho = TonKho + ? WHERE MaSP = ?", [ct.SoLuong, ct.MaSP]);
        }
      }
    }

    await conn.commit();
    res.json({ message: "Cập nhật phiếu giao thành công" });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ message: "Lỗi cập nhật phiếu giao", error: err.message });
  } finally {
    conn.release();
  }
};

/**
 * DELETE /api/admin/shipping/:id
 */
export const deleteShipping = async (req, res) => {
  try {
    await pool.query("DELETE FROM PHIEU_GIAO_HANG WHERE MaPhieuGiao=?", [req.params.id]);
    res.json({ message: "Xóa phiếu giao thành công" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi xóa phiếu giao", error: err.message });
  }
};
