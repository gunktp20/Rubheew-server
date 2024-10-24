import express from "express";
import {
  insertItemToCart,
  getCarts,
  deleteCartById,
  getCartById,
} from "../controller/cart.controller.js";
// import { getItemsInCart } from "../controller/cart.controller.js";
import authJWT from "../middleware/auth-jwt.js";
const router = express.Router();

router.route("/").get(authJWT, getCarts);
router.route("/:cart_id").get(authJWT, getCartById);
router.route("/").post(authJWT, insertItemToCart);
router.route("/:cart_id").delete(authJWT, deleteCartById);

export default router;
