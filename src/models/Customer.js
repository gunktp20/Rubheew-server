import { DataTypes } from "sequelize";
import sequelize from "../db/connection.js";
import Order from "./Order.js";
import CartItem from "./CartItem.js";
import Report from "./Report.js";

const Customer = sequelize.define("customers", {
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
    unique: false,
    allowNull: false,
  },
  lname: {
    type: DataTypes.STRING,
    unique: false,
    allowNull: false,
  },
  email: {
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
  banned: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
  },
  phone_number: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

Customer.hasOne(Order, {
  foreignKey: "customer_id",
  sourceKey: "id",
});

Customer.hasMany(Report, {
  foreignKey: "customer_id",
  sourceKey: "id",
});

Customer.hasOne(CartItem, {
  foreignKey: "customer_id",
  sourceKey: "id",
});

Order.belongsTo(Customer, { foreignKey: "customer_id" });
Report.belongsTo(Customer, { foreignKey: "customer_id" });
// Order.belongsTo(Customer, { foreignKey: "customer_id" });

Customer.sync({ force: false })
  .then(async () => {
    console.log("Customer table was created !");
  })
  .catch((err) => {
    console.log(err);
  });

export default Customer;
