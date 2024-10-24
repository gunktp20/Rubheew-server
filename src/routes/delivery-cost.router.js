import express from "express";
import {
  getDeliveryCost,
  updateShippingFee,
} from "../controller/delivery-cost.controller.js";
const router = express.Router();
import requireAdmin from "../middleware/require-admin.js";
import authJWT from "../middleware/auth-jwt.js";

router.route("/").get(getDeliveryCost);
router.route("/").put(authJWT, requireAdmin, updateShippingFee);

export default router;
