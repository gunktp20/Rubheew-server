import { DataTypes } from "sequelize";
import sequelize from "../db/connection.js";
import Cart from "./Cart.js";
import Menu from "./Menu.js";

const CartItem = sequelize.define(
  "cart_items",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    cart_id: {
      type: DataTypes.UUID,
      references: {
        model: "carts",
        key: "id",
      },
    },
    customer_id: {
      type: DataTypes.UUID,
      references: {
        model: "customers",
        key: "id",
      },
    },
    menu_id: {
      type: DataTypes.UUID,
      references: {
        model: "menus",
        key: "id",
      },
    },
    vendor_id: {
      type: DataTypes.UUID,
      references: {
        model: "vendors",
        key: "id",
      },
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
  },
  {
    hooks: {
      afterDestroy: async (cartItem, options) => {
        // ค้นหา Cart ที่ cart item ถูกลบไป
        const cart = await Cart.findOne({ where: { id: cartItem.cart_id } });
        if (cart) {
          // ค้นหา CartItem ที่เหลือใน Cart นั้น

          // const remainingCartItems = await CartItem.findAll({
          //   where: { cart_id: cartItem.cart_id },
          // });

          // console.log("cartItem",cartItem.dataValues)

          // console.log("cartItem",cartItem.price)

          // คำนวณยอดรวมใหม่จาก CartItem ที่เหลือ

          cart.total_price = cart.total_price - cartItem.price;
          await cart.save();
          // const newTotalPrice = await remainingCartItems.reduce((total, item) => {
          //   return total + item.price * item.quantity;
          // }, 0);

        }
      },
    },
  }
);

Cart.hasMany(CartItem, {
  foreignKey: "cart_id",
  sourceKey: "id",
});

CartItem.belongsTo(Cart, { foreignKey: "cart_id" });

CartItem.sync({ force: false })
  .then(async () => {
    console.log("Cart item table was created !");
  })
  .catch((err) => {
    console.log(err);
  });

export default CartItem;
