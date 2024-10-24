import upload from "../middleware/multer-upload.js";
import express from "express";
import requireAdmin from "../middleware/require-admin.js";
import authJWT from "../middleware/auth-jwt.js";
import {
  deletePromotion,
  getAllPromotions,
  insertPromotion,
} from "../controller/promotion.controller.js";

const router = express.Router();

router
  .route("/")
  .post(authJWT, requireAdmin, upload.single("image"), insertPromotion);

router.route("/:promotion_id").delete(authJWT, requireAdmin, deletePromotion);
router.route("/").get(getAllPromotions);

export default router;
