import express from "express";
import authAdmin from "../middleware/authAdmin.js";
import {
  getNhatKyList, getNhatKyById, thongKeNhatKy,
} from "../controllers/nhatKyAiController.js";

const router = express.Router();
router.use(authAdmin);

router.get("/thong-ke", thongKeNhatKy);
router.get("/", getNhatKyList);
router.get("/:id", getNhatKyById);

export default router;
