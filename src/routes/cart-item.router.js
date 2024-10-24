import express from "express";
import authJWT from "../middleware/auth-jwt.js";
import {
  decreaseCartItem,
  deleteCartItem,
  getCartItemsNumber,
  increaseCartItem,
} from "../controller/cart-item.controller.js";
const router = express.Router();

router.route("/:cart_item_id").delete(authJWT, deleteCartItem);
router.route("/:cart_item_id/increase").get(authJWT, increaseCartItem);
router.route("/:cart_item_id/decrease").get(authJWT, decreaseCartItem);
router.route("/").get(authJWT, getCartItemsNumber);

export default router;
