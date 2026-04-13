import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Thư mục lưu ảnh: backend/uploads/products/
const uploadDir = path.join(__dirname, "../../uploads/products");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, name);
  },
});

const fileFilter = (_req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|webp/;
  const ok = allowed.test(path.extname(file.originalname).toLowerCase()) &&
             allowed.test(file.mimetype);
  ok ? cb(null, true) : cb(new Error("Chỉ cho phép file ảnh (jpg, png, gif, webp)"));
};

export const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

/**
 * POST /api/admin/upload/product-image
 */
export const uploadProductImage = (req, res) => {
  if (!req.file) return res.status(400).json({ message: "Không có file được tải lên" });
  // Trả về đường dẫn tương đối để lưu vào DB
  res.json({ message: "Upload thành công", path: `products/${req.file.filename}`, filename: req.file.filename });
};
