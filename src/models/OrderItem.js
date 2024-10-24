import { DataTypes } from "sequelize";
import sequelize from "../db/connection.js";

const OrderItem = sequelize.define("order_items", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  order_id: {
    type: DataTypes.UUID,
    references: {
      model: "orders",
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
});

OrderItem.sync({ force: false })
  .then(async () => {
    console.log("Order item table was created !");
  })
  .catch((err) => {
    console.log(err);
  });

export default OrderItem;
