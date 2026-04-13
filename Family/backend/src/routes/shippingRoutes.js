import express from "express";
import authAdmin from "../middleware/authAdmin.js";
import {
  getShipping, createShipping, getShippingById, updateShipping, deleteShipping, getOrderOptions,
} from "../controllers/shippingController.js";

const router = express.Router();
router.use(authAdmin);
router.get("/order-options", getOrderOptions);
router.get("/", getShipping);
router.get("/:id", getShippingById);
router.post("/", createShipping);
router.put("/:id", updateShipping);
router.delete("/:id", deleteShipping);
export default router;
