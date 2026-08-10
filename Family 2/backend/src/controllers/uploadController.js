import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Thư mục lưu ảnh sản phẩm
const uploadProductDir = path.join(__dirname, "../../uploads/products");
if (!fs.existsSync(uploadProductDir)) fs.mkdirSync(uploadProductDir, { recursive: true });

// Thư mục lưu ảnh khuyến mãi
const uploadPromotionDir = path.join(__dirname, "../../uploads/promotions");
if (!fs.existsSync(uploadPromotionDir)) fs.mkdirSync(uploadPromotionDir, { recursive: true });

const makeStorage = (dir) =>
  multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, dir),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname);
      cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
    },
  });

const fileFilter = (_req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|webp/;
  const ok =
    allowed.test(path.extname(file.originalname).toLowerCase()) &&
    allowed.test(file.mimetype);
  ok ? cb(null, true) : cb(new Error("Chỉ cho phép file ảnh (jpg, png, gif, webp)"));
};

export const upload = multer({ storage: makeStorage(uploadProductDir), fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });
export const uploadPromotion = multer({ storage: makeStorage(uploadPromotionDir), fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

/** POST /api/admin/upload/product-image */
export const uploadProductImage = (req, res) => {
  if (!req.file) return res.status(400).json({ message: "Không có file được tải lên" });
  res.json({ message: "Upload thành công", path: `products/${req.file.filename}`, filename: req.file.filename });
};

/** POST /api/admin/upload/promotion-image */
export const uploadPromotionImage = (req, res) => {
  if (!req.file) return res.status(400).json({ message: "Không có file được tải lên" });
  res.json({ message: "Upload thành công", path: `promotions/${req.file.filename}`, filename: req.file.filename });
};
