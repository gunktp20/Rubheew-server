import { DataTypes } from "sequelize";
import sequelize from "../db/connection.js";

const Promotion = sequelize.define("promotions", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  image: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

Promotion.sync({ force: false })
  .then(async () => {
    console.log("Promotion table was created !");
  })
  .catch((err) => {
    console.log(err);
  });

export default Promotion;
