import express from "express";
import {
  register,
  login,
  getAllRiders,
  deleteVendorRider,
  getOrderRiderById
} from "../controller/rider.controller.js";
const router = express.Router();
import authJWT from "../middleware/auth-jwt.js";
import requireVendor from "../middleware/require-vendor.js";
import requireRider from "../middleware/require-rider.js";

router.route("/register").post(register);
router.route("/login").post(login);
router.route("/").get(getAllRiders);

router.route("/order/:order_id").get(authJWT,requireRider,getOrderRiderById);

router.route("/:rider_id").delete(authJWT, requireVendor, deleteVendorRider);

export default router;
