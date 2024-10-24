import { DataTypes } from "sequelize";
import sequelize from "../db/connection.js";
import Vendor from "./Vendor.js";
import Destination from "./Destination.js";
import Customer from "./Customer.js";
import OrderItem from "./OrderItem.js";
import Rider from "./Rider.js";

const Order = sequelize.define("orders", {
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
  rider_id: {
    type: DataTypes.UUID,
    references: {
      model: "riders",
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
  slip_image: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  delivery_image: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  note: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM(
      "pending",
      "confirmed",
      "preparing",
      "out_for_delivery",
      "delivered",
      "cancelled"
    ),
    allowNull: false,
  },
  total_price: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  destination_id: {
    type: DataTypes.UUID,
    references: {
      model: "destinations",
      key: "id",
    },
  },
});

Order.hasMany(OrderItem, {
  foreignKey: "order_id",
  sourceKey: "id",
});

Destination.hasMany(Order, {
  foreignKey: "destination_id",
  sourceKey: "id",
});

Rider.hasMany(Order, {
  foreignKey: "rider_id",
  sourceKey: "id",
});

Vendor.hasMany(Order, {
  foreignKey: "vendor_id",
  sourceKey: "id",
});

OrderItem.belongsTo(Order, { foreignKey: "order_id" });

Order.belongsTo(Vendor, { foreignKey: "vendor_id" });

Order.belongsTo(Destination, { foreignKey: "destination_id" });

Order.sync({ force: false })
  .then(async () => {
    console.log("Order table was created !");
  })
  .catch((err) => {
    console.log(err);
  });

export default Order;
