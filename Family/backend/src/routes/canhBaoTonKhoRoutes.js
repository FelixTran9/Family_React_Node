import express from "express";
import authAdmin from "../middleware/authAdmin.js";
import {
  getCanhBaoList, getCanhBaoById, xuLyCanhBao, quetCanhBao, thongKeCanhBao,
} from "../controllers/canhBaoTonKhoController.js";
import {
  getCauHinhList, getCauHinhById, createCauHinh, updateCauHinh, deleteCauHinh,
} from "../controllers/cauHinhCanhBaoController.js";
import {
  getLoHangList, getLoHangById, updateLoHang,
} from "../controllers/loHangController.js";

const router = express.Router();
router.use(authAdmin);

// Cảnh báo tồn kho
router.get("/thong-ke", thongKeCanhBao);
router.get("/", getCanhBaoList);
router.get("/:id", getCanhBaoById);
router.patch("/:id/xu-ly", xuLyCanhBao);
router.post("/quet", quetCanhBao);

export default router;
