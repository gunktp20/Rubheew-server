import { DataTypes } from "sequelize";
import sequelize from "../db/connection.js";

const DeliveryCost = sequelize.define("delivery_costs", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  shipping_fee: {
    type: DataTypes.INTEGER,
    unique: true,
  },
});

DeliveryCost.sync({ force: false })
  .then(async () => {
    const count = await DeliveryCost.count();
    if (count === 0) {
      await DeliveryCost.create({ shipping_fee: 15 });
    }
    console.log("DeliveryCost table was created !");
  })
  .catch((err) => {
    console.log(err);
  });

export default DeliveryCost;
