import express from "express";
import {
  login,
  deleteMenu,
  deleteVendor,
  approveVendor,
  getAllCustomers,
  banCustomer,
  getVendors,
  getVendorsRegistrations,
} from "../controller/admin.controller.js";
import authJWT from "../middleware/auth-jwt.js";
import requireAdmin from "../middleware/require-admin.js";
const router = express.Router();

router.route("/login").post(login);
router.route("/promotion").post(login);

router
  .route("/vendor/registration")
  .get(authJWT, requireAdmin, getVendorsRegistrations);
router
  .route("/vendor/")
  .get(authJWT, requireAdmin, getVendors);
// vendor & menu operations
router.route("/:vendor_id/vendor").delete(authJWT, requireAdmin, deleteVendor);
router.route("/:menu_id/menu").delete(authJWT, requireAdmin, deleteMenu);
// customer operations
router
  .route("/customer/list")
  .get(authJWT, requireAdmin, getVendorsRegistrations);
router.route("customer/ban").put(authJWT, requireAdmin, banCustomer);
//approve vendor registrations
router.route("/:vendor_id/approve").put(authJWT, requireAdmin, approveVendor);

router
export default router;
