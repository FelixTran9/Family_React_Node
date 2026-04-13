import express from "express";
import authAdmin from "../middleware/authAdmin.js";
import {
  getOrders, createOrder, getOrderById, updateOrder, deleteOrder, getOrderFormOptions,
} from "../controllers/orderAdminController.js";

const router = express.Router();

router.use(authAdmin);
router.get("/form-options", getOrderFormOptions);
router.get("/", getOrders);
router.get("/:id", getOrderById);
router.post("/", createOrder);
router.put("/:id", updateOrder);
router.delete("/:id", deleteOrder);

export default router;
