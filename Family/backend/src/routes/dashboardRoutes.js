import express from "express";
import {
  getDashboardStats,
  getRevenueByMonth,
  getRevenueByDay,
  getOrderByStatus,
  getTopProducts,
  getInventoryReport,
  getPromotionStats,
  getPaymentStats,
  getCategoryStats,
} from "../controllers/dashboardController.js";
import authAdmin from "../middleware/authAdmin.js";

const router = express.Router();

router.get("/", authAdmin, getDashboardStats);
router.get("/revenue-by-month", authAdmin, getRevenueByMonth);
router.get("/revenue-by-day", authAdmin, getRevenueByDay);
router.get("/order-status", authAdmin, getOrderByStatus);
router.get("/top-products", authAdmin, getTopProducts);
router.get("/inventory-report", authAdmin, getInventoryReport);
router.get("/promotion-stats", authAdmin, getPromotionStats);
router.get("/payment-stats", authAdmin, getPaymentStats);
router.get("/category-stats", authAdmin, getCategoryStats);

export default router;
