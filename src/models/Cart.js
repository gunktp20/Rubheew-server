import { DataTypes } from "sequelize";
import sequelize from "../db/connection.js";
import Vendor from "./Vendor.js";
import Destination from "./Destination.js";
import Customer from "./Customer.js";
import OrderItem from "./OrderItem.js";
import CartItem from "./CartItem.js";

const Cart = sequelize.define(
  "carts",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    customer_id: {
      type: DataTypes.UUID,
      references: {
        model: "customers",
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
    total_price: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  }
);

Cart.sync({ force: false })
  .then(async () => {
    console.log("Cart table was created !");
  })
  .catch((err) => {
    console.log(err);
  });

export default Cart;
