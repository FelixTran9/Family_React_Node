import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../config/db.js";

/**
 * POST /api/admin/login
 * Kiểm tra đăng nhập trong 2 bảng: CUA_HANG_TRUONG và TRO_LY_CUA_HANG
 */
export const login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Vui lòng nhập tài khoản và mật khẩu" });
  }

  try {
    // Kiểm tra Trưởng cửa hàng trước
    const [truongs] = await pool.query(
      "SELECT MaCHT, TenCHT, TaiKhoan, MatKhau FROM CUA_HANG_TRUONG WHERE TaiKhoan = ?",
      [username]
    );

    if (truongs.length > 0) {
      const user = truongs[0];
      const isMatch = user.MatKhau.startsWith("$2") 
        ? await bcrypt.compare(password, user.MatKhau)
        : password === user.MatKhau;
        
      if (!isMatch) {
        return res.status(401).json({ message: "Mật khẩu không đúng" });
      }
      const token = jwt.sign(
        { id: user.MaCHT, name: user.TenCHT, role: "truong" },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || "8h" }
      );
      return res.json({
        token,
        user: { id: user.MaCHT, name: user.TenCHT, role: "truong" },
      });
    }

    // Kiểm tra Trợ lý cửa hàng
    const [trolys] = await pool.query(
      "SELECT MaTL, TenTL, TaiKhoan, MatKhau FROM TRO_LY_CUA_HANG WHERE TaiKhoan = ?",
      [username]
    );

    if (trolys.length > 0) {
      const user = trolys[0];
      const isMatch = user.MatKhau.startsWith("$2") 
        ? await bcrypt.compare(password, user.MatKhau)
        : password === user.MatKhau;

      if (!isMatch) {
        return res.status(401).json({ message: "Mật khẩu không đúng" });
      }
      const token = jwt.sign(
        { id: user.MaTL, name: user.TenTL, role: "troly" },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || "8h" }
      );
      return res.json({
        token,
        user: { id: user.MaTL, name: user.TenTL, role: "troly" },
      });
    }

    return res.status(401).json({ message: "Tài khoản không tồn tại" });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Lỗi máy chủ", error: err.message });
  }
};

/**
 * GET /api/admin/me
 * Lấy thông tin admin hiện tại từ token
 */
export const getMe = (req, res) => {
  res.json({ user: req.adminUser });
};
