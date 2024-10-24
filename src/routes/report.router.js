import express from "express";
import authJWT from "../middleware/auth-jwt.js";
import { createReport, getAllReports } from "../controller/report.controller.js";
import requireCustomer from "../middleware/require-customer.js";
import requireAdmin from "../middleware/require-admin.js";
const router = express.Router();

router.route("/").post(authJWT, requireCustomer, createReport);
router.route("/").get(authJWT, requireAdmin, getAllReports);

export default router;
