import crypto from "crypto";
import pool from "../config/db.js";

const ORDER_FLOW = ["chờ_xác_nhận", "đã_xác_nhận", "đang_giao", "đã_giao"];
const genMaDon = () => "ĐH" + crypto.randomBytes(4).toString("hex").toUpperCase();

/**
 * GET /api/admin/orders?q=...&page=1&limit=15
 */
export const getOrders = async (req, res) => {
  const { q = "", page = 1, limit = 15 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);
  const search = `%${q}%`;
  try {
    const [rows] = await pool.query(
      `SELECT d.MaDon, d.NgayDat, d.MaKH, kh.TenKH, d.NguoiBan, d.TrangThai,
              d.TongThanhToan, d.HinhThucTT
       FROM DON_BAN_HANG d
       LEFT JOIN KHACH_HANG kh ON d.MaKH = kh.MaKH
       WHERE d.MaDon LIKE ? OR d.MaKH LIKE ? OR d.NguoiBan LIKE ?
       ORDER BY d.NgayDat DESC
       LIMIT ? OFFSET ?`,
      [search, search, search, parseInt(limit), offset]
    );
    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM DON_BAN_HANG
       WHERE MaDon LIKE ? OR MaKH LIKE ? OR NguoiBan LIKE ?`,
      [search, search, search]
    );
    res.json({ data: rows, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    res.status(500).json({ message: "Lỗi lấy danh sách đơn hàng", error: err.message });
  }
};

/**
 * GET /api/admin/orders/form-options — Dữ liệu cho form tạo đơn
 */
export const getOrderFormOptions = async (req, res) => {
  try {
    const [khachhangs] = await pool.query("SELECT MaKH, TenKH FROM KHACH_HANG");
    const [nhanviens] = await pool.query("SELECT MaNV, TenNV FROM NHAN_VIEN WHERE TrangThai='active' OR TrangThai IS NULL");
    const [sanphams] = await pool.query("SELECT MaSP, TenSP, GiaBan, TonKho FROM SAN_PHAM WHERE TonKho > 0");
    res.json({ khachhangs, nhanviens, sanphams });
  } catch (err) {
    res.status(500).json({ message: "Lỗi lấy form options", error: err.message });
  }
};

/**
 * GET /api/admin/orders/:id
 */
export const getOrderById = async (req, res) => {
  try {
    const [don] = await pool.query(
      `SELECT d.*, kh.TenKH FROM DON_BAN_HANG d
       LEFT JOIN KHACH_HANG kh ON d.MaKH = kh.MaKH
       WHERE d.MaDon = ?`,
      [req.params.id]
    );
    if (don.length === 0) return res.status(404).json({ message: "Không tìm thấy đơn hàng" });

    const [chiTiet] = await pool.query(
      `SELECT ct.*, sp.TenSP FROM CT_DON_BAN ct
       LEFT JOIN SAN_PHAM sp ON ct.MaSP = sp.MaSP
       WHERE ct.MaDon = ?`,
      [req.params.id]
    );
    res.json({ don: don[0], chiTiet });
  } catch (err) {
    res.status(500).json({ message: "Lỗi lấy đơn hàng", error: err.message });
  }
};

/**
 * POST /api/admin/orders
 */
export const createOrder = async (req, res) => {
  const { MaKH, NguoiBan, HinhThucTT, items } = req.body;
  if (!MaKH || !NguoiBan || !items || items.length === 0) {
    return res.status(400).json({ message: "Thiếu thông tin đơn hàng" });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    let MaDon = genMaDon();
    let [check] = await conn.query("SELECT MaDon FROM DON_BAN_HANG WHERE MaDon = ?", [MaDon]);
    while (check.length > 0) {
      MaDon = genMaDon();
      [check] = await conn.query("SELECT MaDon FROM DON_BAN_HANG WHERE MaDon = ?", [MaDon]);
    }

    await conn.query(
      `INSERT INTO DON_BAN_HANG (MaDon, NgayDat, MaKH, NguoiBan, HinhThucTT, TrangThai,
        TongTienHang, TongThueVAT, TongChietKhau, TongThanhToan)
       VALUES (?, NOW(), ?, ?, ?, 'chờ_xác_nhận', 0, 0, 0, 0)`,
      [MaDon, MaKH, NguoiBan, HinhThucTT || "Tiền mặt"]
    );

    let tongTienHang = 0, tongThueVAT = 0, tongChietKhau = 0;

    for (const item of items) {
      const [spRows] = await conn.query(
        "SELECT GiaBan, TonKho FROM SAN_PHAM WHERE MaSP = ?",
        [item.MaSP]
      );
      if (spRows.length === 0) throw new Error(`Sản phẩm ${item.MaSP} không tồn tại`);
      if (spRows[0].TonKho < item.SoLuong) {
        throw new Error(`Sản phẩm ${item.MaSP} không đủ tồn kho`);
      }

      const donGia = item.DonGia || spRows[0].GiaBan;
      const thueVAT = donGia * item.SoLuong * 0.1;
      const chietKhau = 0;
      const thanhTien = donGia * item.SoLuong + thueVAT - chietKhau;

      await conn.query(
        `INSERT INTO CT_DON_BAN (MaDon, MaSP, SoLuong, DonGia, ThueVAT, ChietKhau, ThanhTien)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [MaDon, item.MaSP, item.SoLuong, donGia, thueVAT, chietKhau, thanhTien]
      );

      tongTienHang += donGia * item.SoLuong;
      tongThueVAT += thueVAT;
      tongChietKhau += chietKhau;

      await conn.query(
        "UPDATE SAN_PHAM SET TonKho = TonKho - ? WHERE MaSP = ?",
        [item.SoLuong, item.MaSP]
      );
    }

    const tongThanhToan = tongTienHang + tongThueVAT - tongChietKhau;
    await conn.query(
      `UPDATE DON_BAN_HANG SET TongTienHang=?, TongThueVAT=?, TongChietKhau=?, TongThanhToan=?
       WHERE MaDon=?`,
      [tongTienHang, tongThueVAT, tongChietKhau, tongThanhToan, MaDon]
    );

    await conn.commit();
    res.status(201).json({ message: "Tạo đơn hàng thành công", MaDon });
  } catch (err) {
    await conn.rollback();
    res.status(400).json({ message: "Lỗi tạo đơn hàng: " + err.message });
  } finally {
    conn.release();
  }
};

/**
 * PUT /api/admin/orders/:id — Cập nhật trạng thái (state machine)
 */
export const updateOrder = async (req, res) => {
  const { TrangThai, HinhThucTT } = req.body;
  const VALID = [...ORDER_FLOW, "đã_hủy"];
  if (!VALID.includes(TrangThai)) {
    return res.status(400).json({ message: "Trạng thái không hợp lệ" });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [[don]] = await conn.query(
      "SELECT TrangThai FROM DON_BAN_HANG WHERE MaDon = ?",
      [req.params.id]
    );
    if (!don) {
      await conn.rollback();
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }

    const currentStatus = don.TrangThai;
    const currentIdx = ORDER_FLOW.indexOf(currentStatus);
    const newIdx = ORDER_FLOW.indexOf(TrangThai);

    if (TrangThai === "đã_hủy") {
      if (currentIdx >= 2) {
        await conn.rollback();
        return res.status(400).json({ message: "Đơn đang giao hoặc đã giao, không thể hủy" });
      }
      if (currentStatus !== "đã_hủy") {
        // Hoàn kho
        const [chiTiet] = await conn.query(
          "SELECT MaSP, SoLuong FROM CT_DON_BAN WHERE MaDon = ?",
          [req.params.id]
        );
        for (const ct of chiTiet) {
          await conn.query(
            "UPDATE SAN_PHAM SET TonKho = TonKho + ? WHERE MaSP = ?",
            [ct.SoLuong, ct.MaSP]
          );
        }
      }
    } else {
      if (currentIdx !== -1 && newIdx !== -1) {
        if (newIdx < currentIdx) {
          await conn.rollback();
          return res.status(400).json({ message: "Không thể quay ngược trạng thái" });
        }
        if (newIdx > currentIdx + 1) {
          await conn.rollback();
          return res.status(400).json({ message: "Vui lòng cập nhật theo đúng trình tự" });
        }
      }
    }

    await conn.query(
      "UPDATE DON_BAN_HANG SET TrangThai=?, HinhThucTT=COALESCE(?, HinhThucTT) WHERE MaDon=?",
      [TrangThai, HinhThucTT || null, req.params.id]
    );
    await conn.commit();
    res.json({ message: "Cập nhật trạng thái thành công: " + TrangThai });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ message: "Lỗi cập nhật đơn hàng", error: err.message });
  } finally {
    conn.release();
  }
};

/**
 * DELETE /api/admin/orders/:id
 */
export const deleteOrder = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [[don]] = await conn.query(
      "SELECT TrangThai FROM DON_BAN_HANG WHERE MaDon = ?",
      [req.params.id]
    );
    if (!don) {
      await conn.rollback();
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }
    if (don.TrangThai !== "đã_hủy") {
      const [chiTiet] = await conn.query(
        "SELECT MaSP, SoLuong FROM CT_DON_BAN WHERE MaDon = ?",
        [req.params.id]
      );
      for (const ct of chiTiet) {
        await conn.query(
          "UPDATE SAN_PHAM SET TonKho = TonKho + ? WHERE MaSP = ?",
          [ct.SoLuong, ct.MaSP]
        );
      }
    }
    await conn.query("DELETE FROM CT_DON_BAN WHERE MaDon = ?", [req.params.id]);
    await conn.query("DELETE FROM DON_BAN_HANG WHERE MaDon = ?", [req.params.id]);
    await conn.commit();
    res.json({ message: "Xóa đơn hàng thành công" });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ message: "Lỗi xóa đơn hàng", error: err.message });
  } finally {
    conn.release();
  }
};
