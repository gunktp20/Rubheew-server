import { DataTypes } from "sequelize";
import sequelize from "../db/connection.js";

const Report = sequelize.define("reports", {
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
  content: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

Report.sync({ force: false })
  .then(async () => {
    console.log("Report table was created !");
  })
  .catch((err) => {
    console.log(err);
  });

export default Report;
