import express from "express";
import {
  getAllMenu,
  insertMenu,
  getAllMenuByVendorId,
  getMenuInfoById,
  updateMenuById,
  deleteMenuById,
} from "../controller/menu.controller.js";
import requireVendor from "../middleware/require-vendor.js";
import authJWT from "../middleware/auth-jwt.js";
import upload from "../middleware/multer-upload.js";
const router = express.Router();

router
  .route("/")
  .post(authJWT, requireVendor, upload.single("image"), insertMenu);
router.route("/").get(getAllMenu);
router.route("/:menu_id").get(getMenuInfoById);
router.route("/:menu_id").delete(authJWT,requireVendor,deleteMenuById);
router
  .route("/:menu_id")
  .put(authJWT, requireVendor, upload.single("image"), updateMenuById);
router.route("/vendor/:vendor_id").get(getAllMenuByVendorId);

export default router;
