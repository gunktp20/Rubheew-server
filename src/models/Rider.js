import { DataTypes } from "sequelize";
import sequelize from "../db/connection.js";
import Order from "./Order.js";
import CartItem from "./CartItem.js";
import Vendor from "./Vendor.js";

const Rider = sequelize.define("riders", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  username: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  fname: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  lname: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  vendor_id: {
    type: DataTypes.UUID,
    references: {
      model: "vendors",
      key: "id",
    },
  },
  active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false,
  },
  phone_number: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

// Rider.hasOne(Order, {
//   foreignKey: "rider_id",
//   sourceKey: "id",
// });

// Order.belongsTo(Customer, { foreignKey: "customer_id" });

Rider.sync({ force: false })
  .then(async () => {
    console.log("Rider table was created !");
  })
  .catch((err) => {
    console.log(err);
  });

export default Rider;
