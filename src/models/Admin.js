import { DataTypes } from "sequelize";
import sequelize from "../db/connection.js";
import bcrypt from "bcrypt";

const Admin = sequelize.define("admins", {
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
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

Admin.sync({ force: false })
  .then(async () => {
    const count = await Admin.count();
    if (count === 0) {
      const username = "admin";
      const password = "password123";
      const salt = await bcrypt.genSalt(10);
      const encodedPassword = await bcrypt.hash(password, salt);
      await Admin.create({ username, password: encodedPassword });
    }
    console.log("Admin table was created !");
  })
  .catch((err) => {
    console.log(err);
  });

export default Admin;
