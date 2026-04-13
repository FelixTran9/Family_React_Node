import crypto from "crypto";
import pool from "../config/db.js";

const genMaKH = () => "KH" + crypto.randomBytes(4).toString("hex").toUpperCase();
const genMaDon = () => "ĐH" + crypto.randomBytes(4).toString("hex").toUpperCase();

/**
 * GET /api/products/categories — Danh mục cho trang khách hàng
 */
export const getCategories = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT MaDanhMuc, TenDanhMuc FROM DANH_MUC_SP ORDER BY TenDanhMuc");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Lỗi lấy danh mục", error: err.message });
  }
};

/**
 * POST /api/orders — Khách hàng đặt hàng
 * Body: { TenKH, SDT, DiaChi, Email, HinhThucTT, items: [{MaSP, SoLuong}] }
 */
export const customerPlaceOrder = async (req, res) => {
  const { TenKH, SDT, DiaChi, Email, HinhThucTT, items } = req.body;

  if (!TenKH || !SDT || !items || items.length === 0) {
    return res.status(400).json({ message: "Thiếu thông tin: Họ tên, SĐT và sản phẩm là bắt buộc" });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // 1. Tìm hoặc tạo khách hàng theo SDT
    let MaKH;
    const [existing] = await conn.query("SELECT MaKH FROM KHACH_HANG WHERE SDT = ?", [SDT]);
    if (existing.length > 0) {
      MaKH = existing[0].MaKH;
      // Cập nhật thông tin nếu cần
      await conn.query(
        "UPDATE KHACH_HANG SET TenKH=?, DiaChi=COALESCE(?, DiaChi), Email=COALESCE(?, Email) WHERE MaKH=?",
        [TenKH, DiaChi || null, Email || null, MaKH]
      );
    } else {
      MaKH = genMaKH();
      let [check] = await conn.query("SELECT MaKH FROM KHACH_HANG WHERE MaKH = ?", [MaKH]);
      while (check.length > 0) {
        MaKH = genMaKH();
        [check] = await conn.query("SELECT MaKH FROM KHACH_HANG WHERE MaKH = ?", [MaKH]);
      }
      await conn.query(
        "INSERT INTO KHACH_HANG (MaKH, TenKH, SDT, DiaChi, Email) VALUES (?, ?, ?, ?, ?)",
        [MaKH, TenKH, SDT, DiaChi || null, Email || null]
      );
    }

    // 2. Tạo đơn hàng
    let MaDon = genMaDon();
    let [checkDon] = await conn.query("SELECT MaDon FROM DON_BAN_HANG WHERE MaDon = ?", [MaDon]);
    while (checkDon.length > 0) {
      MaDon = genMaDon();
      [checkDon] = await conn.query("SELECT MaDon FROM DON_BAN_HANG WHERE MaDon = ?", [MaDon]);
    }

    await conn.query(
      `INSERT INTO DON_BAN_HANG (MaDon, NgayDat, MaKH, HinhThucTT, TrangThai,
        TongTienHang, TongThueVAT, TongChietKhau, TongThanhToan)
       VALUES (?, NOW(), ?, ?, 'chờ_xác_nhận', 0, 0, 0, 0)`,
      [MaDon, MaKH, HinhThucTT || "Tiền mặt"]
    );

    // 3. Thêm chi tiết đơn
    let tongTienHang = 0, tongThueVAT = 0;

    for (const item of items) {
      const [spRows] = await conn.query(
        "SELECT GiaBan, TonKho, TenSP FROM SAN_PHAM WHERE MaSP = ?",
        [item.MaSP]
      );
      if (spRows.length === 0) throw new Error(`Sản phẩm ${item.MaSP} không tồn tại`);
      if (spRows[0].TonKho < item.SoLuong) {
        throw new Error(`Sản phẩm "${spRows[0].TenSP}" không đủ tồn kho (còn ${spRows[0].TonKho})`);
      }

      const donGia = spRows[0].GiaBan;
      const thueVAT = donGia * item.SoLuong * 0.1;
      const thanhTien = donGia * item.SoLuong + thueVAT;

      await conn.query(
        `INSERT INTO CT_DON_BAN (MaDon, MaSP, SoLuong, DonGia, ThueVAT, ChietKhau, ThanhTien)
         VALUES (?, ?, ?, ?, ?, 0, ?)`,
        [MaDon, item.MaSP, item.SoLuong, donGia, thueVAT, thanhTien]
      );

      tongTienHang += donGia * item.SoLuong;
      tongThueVAT += thueVAT;

      await conn.query(
        "UPDATE SAN_PHAM SET TonKho = TonKho - ? WHERE MaSP = ?",
        [item.SoLuong, item.MaSP]
      );
    }

    const tongThanhToan = tongTienHang + tongThueVAT;
    await conn.query(
      `UPDATE DON_BAN_HANG SET TongTienHang=?, TongThueVAT=?, TongChietKhau=0, TongThanhToan=? WHERE MaDon=?`,
      [tongTienHang, tongThueVAT, tongThanhToan, MaDon]
    );

    await conn.commit();
    res.status(201).json({
      message: "Đặt hàng thành công!",
      MaDon,
      MaKH,
      TongThanhToan: tongThanhToan,
    });
  } catch (err) {
    await conn.rollback();
    res.status(400).json({ message: "Lỗi đặt hàng: " + err.message });
  } finally {
    conn.release();
  }
};
