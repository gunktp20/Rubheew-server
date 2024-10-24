import express from "express";
import {
  getAllVendors,
  getVendorInfo,
  login,
  register,
  updateVendorInfo,
  toggleOpen,
  getVendorMenus,
  insertRider,
  getRiderOfVendor
} from "../controller/vendor.controller.js";
import authJWT from "../middleware/auth-jwt.js";
import upload from "../middleware/multer-upload.js";
import requireVendor from "../middleware/require-vendor.js";
const router = express.Router();

router.route("/register").post(upload.single("image"), register);
router.route("/login").post(login);
router.route("/insert/rider").put(authJWT, requireVendor, insertRider);
router.route("/rider/info").get(authJWT, requireVendor, getRiderOfVendor);

router.route("/:vendor_id").get(getVendorInfo);
router.route("/").get(getAllVendors);

router.route("/menus/info").get(authJWT, requireVendor, getVendorMenus);
router.route("/toggle-open").put(authJWT, requireVendor, toggleOpen);
router.route("/").put(authJWT, requireVendor, updateVendorInfo);

export default router;
