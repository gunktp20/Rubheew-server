import { DataTypes } from "sequelize";
import sequelize from "../db/connection.js";
import Menu from "./Menu.js";
import Order from "./Order.js";
import Cart from "./Cart.js";
import Rider from "./Rider.js";

const Vendor = sequelize.define("vendors", {
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
  vendor_name: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
  },
  phone_number: {
    type: DataTypes.STRING,
    // unique: true,
    allowNull: false,
  },
  prompt_pay: {
    type: DataTypes.STRING,
    // unique: true,
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING,
    // unique: true,
    allowNull: true,
  },
  image: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  open: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
});

Vendor.hasMany(Menu, {
  foreignKey: "vendor_id",
  sourceKey: "id",
});

Vendor.hasMany(Rider, {
  foreignKey: "vendor_id",
  sourceKey: "id",
});

Vendor.hasMany(Cart, {
  foreignKey: "vendor_id",
  sourceKey: "id",
});

Menu.belongsTo(Vendor, {
  foreignKey: "vendor_id",
});

Rider.belongsTo(Vendor, {
  foreignKey: "vendor_id",
});

Cart.belongsTo(Vendor, { foreignKey: "vendor_id" });

Vendor.sync({ force: false })
  .then(async () => {
    console.log("Vendor table was created !");
  })
  .catch((err) => {
    console.log(err);
  });

export default Vendor;
