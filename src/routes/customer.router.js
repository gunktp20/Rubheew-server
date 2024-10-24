import express from "express";
import {
  register,
  login,
  verifyEmailWithToken,
} from "../controller/customer.controller.js";
const router = express.Router();

router.route("/register").post(register);
router.route("/login").post(login);
router.route("/verify-email/:token").get(verifyEmailWithToken);

export default router;
