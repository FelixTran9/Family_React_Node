import express from "express";
import { getDashboardStats } from "../controllers/dashboardController.js";
import authAdmin from "../middleware/authAdmin.js";

const router = express.Router();

router.get("/", authAdmin, getDashboardStats);

export default router;
