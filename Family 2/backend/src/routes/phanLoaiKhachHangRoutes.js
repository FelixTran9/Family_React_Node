import express from "express";
import authAdmin from "../middleware/authAdmin.js";
import {
  getKhachHangVip, chayPhanLoaiRFM, getDanhSachKy, getLichSuKhach,
} from "../controllers/phanLoaiKhachHangController.js";
import {
  getChamSocList, getChamSocById, createChamSoc, updateChamSoc, deleteChamSoc,
} from "../controllers/chamSocKhachHangController.js";

const router = express.Router();
router.use(authAdmin);

// Phân loại RFM
router.get("/khach-hang-vip", getKhachHangVip);
router.post("/chay-rfm", chayPhanLoaiRFM);
router.get("/ky", getDanhSachKy);
router.get("/lich-su/:maKH", getLichSuKhach);

// Chăm sóc khách hàng
router.get("/cham-soc", getChamSocList);
router.get("/cham-soc/:id", getChamSocById);
router.post("/cham-soc", createChamSoc);
router.put("/cham-soc/:id", updateChamSoc);
router.delete("/cham-soc/:id", deleteChamSoc);

export default router;
