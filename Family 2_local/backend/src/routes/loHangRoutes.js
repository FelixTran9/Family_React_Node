import express from "express";
import authAdmin from "../middleware/authAdmin.js";
import {
  getLoHangList, getLoHangById, updateLoHang,
} from "../controllers/loHangController.js";

const router = express.Router();
router.use(authAdmin);

router.get("/", getLoHangList);
router.get("/:id", getLoHangById);
router.put("/:id", updateLoHang);

export default router;
