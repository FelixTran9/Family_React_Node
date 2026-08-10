import express from "express";
import authAdmin from "../middleware/authAdmin.js";
import {
  getSuppliers, createSupplier, getSupplierById, updateSupplier, deleteSupplier,
} from "../controllers/supplierController.js";

const router = express.Router();
router.use(authAdmin);
router.get("/", getSuppliers);
router.get("/:id", getSupplierById);
router.post("/", createSupplier);
router.put("/:id", updateSupplier);
router.delete("/:id", deleteSupplier);
export default router;
