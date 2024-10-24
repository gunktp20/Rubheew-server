import express from "express";
import authJWT from "../middleware/auth-jwt.js";
import {
  checkoutOrder,
  createOrder,
  getOrderInfoById,
  getOrdersVendor,
  getOrderVendorInfoById,
  getOrders,
  moveToRider,
  confirmOrder,
  deleteOrder,
  getRiderOrders,
  completeOrderWithImage,
  getPendingOrdersVendorNumber,
} from "../controller/order.controller.js";
import upload from "../middleware/multer-upload.js";
import requireVendor from "../middleware/require-vendor.js";
import requireRider from "../middleware/require-rider.js";
const router = express.Router();

router.route("/:cart_id").post(authJWT, createOrder);
router.route("/:order_id").get(authJWT, getOrderInfoById);
router.route("/:order_id").delete(authJWT, deleteOrder);
router.route("/").get(authJWT, getOrders);

router
  .route("/vendor/:order_id/info")
  .get(authJWT, requireVendor, getOrderVendorInfoById);
//   confirm order
router
  .route("/vendor/:order_id/confirm")
  .get(authJWT, requireVendor, confirmOrder);
//   move to rider
router
  .route("/vendor/:order_id/move-to-rider")
  .get(authJWT, requireVendor, moveToRider);

router.route("/vendor/list").get(authJWT, getOrdersVendor);
router.route("/rider/list").get(authJWT, requireRider, getRiderOrders);

router
  .route("/vendor/pending")
  .get(authJWT, requireVendor, getPendingOrdersVendorNumber);

router.route("/:order_id").put(authJWT, upload.single("image"), checkoutOrder);
router
  .route("/:order_id/complete")
  .put(authJWT, upload.single("image"), completeOrderWithImage);

export default router;
