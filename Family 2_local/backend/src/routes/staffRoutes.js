import express from "express";
import authAdmin from "../middleware/authAdmin.js";
import {
  getStaff, createStaff, getStaffById, updateStaff, deleteStaff, getTrolyOptions,
} from "../controllers/staffController.js";

const router = express.Router();

router.use(authAdmin);
router.get("/options", getTrolyOptions);
router.get("/", getStaff);
router.get("/:id", getStaffById);
router.post("/", createStaff);
router.put("/:id", updateStaff);
router.delete("/:id", deleteStaff);

export default router;
