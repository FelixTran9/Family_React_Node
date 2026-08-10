import crypto from "crypto";
import pool from "../config/db.js";

const genMaNCC = () => "NCC" + crypto.randomBytes(3).toString("hex").toUpperCase();

export const getSuppliers = async (req, res) => {
  const { q = "", page = 1, limit = 15 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);
  const search = `%${q}%`;
  try {
    const [rows] = await pool.query(
      `SELECT * FROM NHA_CUNG_CAP
       WHERE TenNCC LIKE ? OR MaNCC LIKE ? OR SDT LIKE ?
       ORDER BY MaNCC DESC LIMIT ? OFFSET ?`,
      [search, search, search, parseInt(limit), offset]
    );
    const [[{ total }]] = await pool.query(
      "SELECT COUNT(*) AS total FROM NHA_CUNG_CAP WHERE TenNCC LIKE ? OR MaNCC LIKE ? OR SDT LIKE ?",
      [search, search, search]
    );
    res.json({ data: rows, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    res.status(500).json({ message: "Lỗi lấy danh sách nhà cung cấp", error: err.message });
  }
};

export const getSupplierById = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM NHA_CUNG_CAP WHERE MaNCC = ?", [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: "Không tìm thấy nhà cung cấp" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Lỗi lấy nhà cung cấp", error: err.message });
  }
};

export const createSupplier = async (req, res) => {
  const { TenNCC, DiaChi, SDT, Email } = req.body;
  if (!TenNCC) return res.status(400).json({ message: "Tên nhà cung cấp là bắt buộc" });
  try {
    let MaNCC = genMaNCC();
    let [check] = await pool.query("SELECT MaNCC FROM NHA_CUNG_CAP WHERE MaNCC = ?", [MaNCC]);
    while (check.length > 0) {
      MaNCC = genMaNCC();
      [check] = await pool.query("SELECT MaNCC FROM NHA_CUNG_CAP WHERE MaNCC = ?", [MaNCC]);
    }
    await pool.query(
      "INSERT INTO NHA_CUNG_CAP (MaNCC, TenNCC, DiaChi, SDT, Email) VALUES (?, ?, ?, ?, ?)",
      [MaNCC, TenNCC, DiaChi || null, SDT || null, Email || null]
    );
    res.status(201).json({ message: "Tạo nhà cung cấp thành công", MaNCC });
  } catch (err) {
    res.status(500).json({ message: "Lỗi tạo nhà cung cấp", error: err.message });
  }
};

export const updateSupplier = async (req, res) => {
  const { TenNCC, DiaChi, SDT, Email } = req.body;
  if (!TenNCC) return res.status(400).json({ message: "Tên nhà cung cấp là bắt buộc" });
  try {
    await pool.query(
      "UPDATE NHA_CUNG_CAP SET TenNCC=?, DiaChi=?, SDT=?, Email=? WHERE MaNCC=?",
      [TenNCC, DiaChi || null, SDT || null, Email || null, req.params.id]
    );
    res.json({ message: "Cập nhật nhà cung cấp thành công" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi cập nhật nhà cung cấp", error: err.message });
  }
};

export const deleteSupplier = async (req, res) => {
  try {
    await pool.query("DELETE FROM NHA_CUNG_CAP WHERE MaNCC=?", [req.params.id]);
    res.json({ message: "Xóa nhà cung cấp thành công" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi xóa nhà cung cấp", error: err.message });
  }
};
