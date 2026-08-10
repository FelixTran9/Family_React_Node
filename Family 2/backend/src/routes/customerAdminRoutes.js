import express from "express";
import authAdmin from "../middleware/authAdmin.js";
import {
  getCustomers, createCustomer, getCustomerById, updateCustomer, deleteCustomer,
} from "../controllers/customerAdminController.js";

const router = express.Router();
router.use(authAdmin);
router.get("/", getCustomers);
router.get("/:id", getCustomerById);
router.post("/", createCustomer);
router.put("/:id", updateCustomer);
router.delete("/:id", deleteCustomer);
export default router;
