import express from "express";
import authAdmin from "../middleware/authAdmin.js";
import {
  getNhapHangList,
  getNhapHangById,
  createNhapHang,
  deleteNhapHang,
  getNhapHangStats,
} from "../controllers/nhapHangController.js";

const router = express.Router();
router.use(authAdmin);

router.get("/stats", getNhapHangStats);
router.get("/", getNhapHangList);
router.get("/:id", getNhapHangById);
router.post("/", createNhapHang);
router.delete("/:id", deleteNhapHang);

export default router;
