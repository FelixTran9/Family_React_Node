import express from "express";
import authAdmin from "../middleware/authAdmin.js";
import {
  getCauHinhList, getCauHinhById, createCauHinh, updateCauHinh, deleteCauHinh,
} from "../controllers/cauHinhCanhBaoController.js";

const router = express.Router();
router.use(authAdmin);

router.get("/", getCauHinhList);
router.get("/:id", getCauHinhById);
router.post("/", createCauHinh);
router.put("/:id", updateCauHinh);
router.delete("/:id", deleteCauHinh);

export default router;
