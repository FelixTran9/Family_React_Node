import express from "express";
import authAdmin from "../middleware/authAdmin.js";
import {
  getProducts, createProduct, getProductById, updateProduct, deleteProduct, getCategories,
} from "../controllers/productAdminController.js";

const router = express.Router();

router.use(authAdmin);
router.get("/categories", getCategories);
router.get("/", getProducts);
router.get("/:id", getProductById);
router.post("/", createProduct);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);

export default router;
