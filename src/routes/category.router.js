import express from "express";
import {
  deleteCategory,
  getCategories,
  insertCategory,
} from "../controller/category.controller.js";
const router = express.Router();
import requireAdmin from "../middleware/require-admin.js";
import authJWT from "../middleware/auth-jwt.js";

router.route("/").get(getCategories);

router.route("/:category_id").delete(authJWT, requireAdmin, deleteCategory);
router.route("/").post(authJWT, requireAdmin, insertCategory);

export default router;
