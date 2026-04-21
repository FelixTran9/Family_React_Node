import express from "express";
import authAdmin from "../middleware/authAdmin.js";
import {
  getChamCong, getChamCongById, createChamCong, updateChamCong, deleteChamCong,
  getBangLuong, getBangLuongById, createBangLuong, updateBangLuong, deleteBangLuong,
  tinhLuong, thanhToanLuong,
} from "../controllers/chamCongController.js";

const router = express.Router();
router.use(authAdmin);

// Chấm công
router.get("/cham-cong", getChamCong);
router.get("/cham-cong/:id", getChamCongById);
router.post("/cham-cong", createChamCong);
router.put("/cham-cong/:id", updateChamCong);
router.delete("/cham-cong/:id", deleteChamCong);

// Bảng lương
router.get("/bang-luong", getBangLuong);
router.get("/bang-luong/:id", getBangLuongById);
router.post("/bang-luong/tinh-luong", tinhLuong);
router.post("/bang-luong", createBangLuong);
router.put("/bang-luong/:id", updateBangLuong);
router.patch("/bang-luong/:id/thanh-toan", thanhToanLuong);
router.delete("/bang-luong/:id", deleteBangLuong);

export default router;
