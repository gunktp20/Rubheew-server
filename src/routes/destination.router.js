import express from "express";
import authJWT from "../middleware/auth-jwt.js";
import {
  deleteDestination,
  getDestinations,
  insertDestination,
} from "../controller/destination.controller.js";
const router = express.Router();
import requireAdmin from "../middleware/require-admin.js";

router.route("/").get(getDestinations);
router
  .route("/:destination_id")
  .delete(authJWT, requireAdmin, deleteDestination);
router.route("/").post(authJWT, requireAdmin, insertDestination);

export default router;
