import express from "express";
import authAdmin from "../middleware/authAdmin.js";
import {
  getPromotions, createPromotion, getPromotionById, updatePromotion, deletePromotion,
} from "../controllers/promotionController.js";

const router = express.Router();
router.use(authAdmin);
router.get("/", getPromotions);
router.get("/:id", getPromotionById);
router.post("/", createPromotion);
router.put("/:id", updatePromotion);
router.delete("/:id", deletePromotion);
export default router;
