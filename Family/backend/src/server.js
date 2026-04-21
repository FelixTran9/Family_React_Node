// Restart nodemon
process.on('exit', (c) => console.log('PROCESS EXIT:', c));
process.on('uncaughtException', (e) => console.log('UNCAUGHT:', e));
process.on('unhandledRejection', (e) => console.log('UNHANDLED:', e));
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Routes
import productRoutes from "./routes/productRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import staffRoutes from "./routes/staffRoutes.js";
import productAdminRoutes from "./routes/productAdminRoutes.js";
import orderAdminRoutes from "./routes/orderAdminRoutes.js";
import shippingRoutes from "./routes/shippingRoutes.js";
import promotionAdminRoutes from "./routes/promotionAdminRoutes.js";
import customerAdminRoutes from "./routes/customerAdminRoutes.js";
import supplierRoutes from "./routes/supplierRoutes.js";
import nhapHangRoutes from "./routes/nhapHangRoutes.js";
import nhanSuRoutes from "./routes/nhanSuRoutes.js";

// Upload & Customer Order
import { upload, uploadProductImage } from "./controllers/uploadController.js";
import authAdmin from "./middleware/authAdmin.js";
import { getCategories, customerPlaceOrder, getCustomerByPhone, updateCustomerByEmail, customerLogin, getCustomerOrdersByEmail } from "./controllers/customerOrderController.js";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 5002;

app.use(cors());
app.use(express.json());

app.post("/test-upload", (req, res) => res.send("TEST UPLOAD IS WORKING " + Date.now()));

// Serve uploaded images — truy cập qua /uploads/products/filename.jpg
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// --- Public Routes ---
app.get("/", (req, res) => res.send("Family API is running..."));
app.use("/api/admin/auth", authRoutes);

// --- Customer-facing API ---
app.use("/api/products", productRoutes);
app.get("/api/categories", getCategories);          // Danh mục sản phẩm
app.post("/api/orders", customerPlaceOrder);          // Khách đặt hàng
app.post("/api/customers/login", customerLogin);      // Đăng nhập khách hàng
app.get("/api/customers/lookup/:sdt", getCustomerByPhone); // Tự động lấy thông tin khách hàng
app.put("/api/customers/:email", updateCustomerByEmail); // Cập nhật thông tin khách hàng
app.get("/api/customers/:email/orders", getCustomerOrdersByEmail); // Lấy lịch sử đơn hàng

// --- Upload ảnh (chỉ admin) ---
app.post(
  "/api/admin/upload/product-image",
  authAdmin,
  upload.single("image"),
  uploadProductImage
);

// --- Admin Protected Routes ---
app.use("/api/admin/dashboard", dashboardRoutes);
app.use("/api/admin/staff", staffRoutes);
app.use("/api/admin/products", productAdminRoutes);
app.use("/api/admin/orders", orderAdminRoutes);
app.use("/api/admin/shipping", shippingRoutes);
app.use("/api/admin/promotions", promotionAdminRoutes);
app.use("/api/admin/customers", customerAdminRoutes);
app.use("/api/admin/suppliers", supplierRoutes);
app.use("/api/admin/nhap-hang", nhapHangRoutes);
app.use("/api/admin/nhan-su", nhanSuRoutes);

import fs from "fs";
import pool from "./config/db.js";

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  try {
    const [rows] = await pool.query("SHOW TABLES LIKE 'PHIEU_NHAP_HANG'");
    if (rows.length === 0) {
      console.log("Migrating database...");
      const sqlPath = path.join(__dirname, "../migration_nhap_hang_nhan_su.sql");
      if (fs.existsSync(sqlPath)) {
        const sql = fs.readFileSync(sqlPath, "utf-8");
        const statements = sql.split(";").filter(s => s.trim() !== "");
        for (const stmt of statements) { await pool.query(stmt); }
        console.log("Migration successful.");
      } else {
        console.log("Migration file not found at " + sqlPath);
      }
    }
  } catch (err) {
    console.error("Migration failed:", err.message);
  }
});