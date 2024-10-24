import express from "express";
import {
  generateQR,
} from "../controller/payment.controller.js";
import authJWT from "../middleware/auth-jwt.js"
const router = express.Router();

router.route("/generateQR/:order_id").get(authJWT,generateQR);

export default router;
