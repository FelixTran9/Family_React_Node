import express from "express";
import authAdmin from "../middleware/authAdmin.js";
import {
  getDuBaoList, getDuBaoById, chayDuBao,
  getDeNghiList, duyetDeNghi, getDanhSachKyDuBao,
} from "../controllers/duBaoXuHuongController.js";

const router = express.Router();
router.use(authAdmin);

// Dự báo xu hướng
router.get("/ky", getDanhSachKyDuBao);
router.get("/", getDuBaoList);
router.get("/:id", getDuBaoById);
router.post("/chay", chayDuBao);

// Đề nghị đặt hàng
router.get("/de-nghi/danh-sach", getDeNghiList);
router.patch("/de-nghi/:id", duyetDeNghi);

export default router;
