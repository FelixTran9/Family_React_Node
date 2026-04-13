import express from "express";
import { login, getMe } from "../controllers/authController.js";
import authAdmin from "../middleware/authAdmin.js";

const router = express.Router();

router.post("/login", login);
router.get("/me", authAdmin, getMe);

export default router;
