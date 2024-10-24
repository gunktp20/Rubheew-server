import { DataTypes } from "sequelize";
import sequelize from "../db/connection.js";

const Category = sequelize.define(
  "categories",
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    category_name: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
  },
  {
    timestamps: false,
  }
);

Category.sync({ force: false })
  .then(async () => {
    const count = await Category.count();
    if (count === 0) {
      // Insert ข้อมูลอัตโนมัติเมื่อสร้างตารางใหม่
      await Category.bulkCreate([
        { id: "SN", category_name: "ขนม" },
        { id: "BE", category_name: "ขนมปัง" },
        { id: "DE", category_name: "ของทอด" },
        { id: "SW", category_name: "ของหวาน" },
        { id: "SO", category_name: "ซุป" },
        { id: "FI", category_name: "ปลาและอาหารทะเล" },
        { id: "FRU", category_name: "ผลไม้" },
        { id: "VE", category_name: "ผัก" },
        { id: "PA", category_name: "พาสต้า" },
        { id: "GRI", category_name: "ย่าง" },
        { id: "SA", category_name: "สลัด" },
        { id: "GR", category_name: "อาหารกรีก" },
        { id: "CI", category_name: "อาหารจีน" },
        { id: "JA", category_name: "อาหารญี่ปุ่น" },
        { id: "BRL", category_name: "อาหารบราซิลเลียน" },
        { id: "FR", category_name: "อาหารฝรั่งเศส" },
        { id: "IT", category_name: "อาหารอิตาเลียน" },
        { id: "IN", category_name: "อาหารอินเดีย" },
        { id: "AM", category_name: "อาหารอเมริกัน" },
        { id: "KO", category_name: "อาหารเกาหลี" },
        { id: "BRK", category_name: "อาหารเช้า" },
        { id: "MX", category_name: "อาหารเม็กซิกัน" },
        { id: "AP", category_name: "อาหารเรียกน้ำย่อย" },
        { id: "VI", category_name: "อาหารเวียดนาม" },
        { id: "CA", category_name: "อาหารแคนาดา" },
        { id: "TH", category_name: "อาหารไทย" },
        { id: "DR", category_name: "เครื่องดื่ม" },
        { id: "SM", category_name: "เครื่องดื่มผสม" },
        { id: "SP", category_name: "เครื่องเทศ" },
        { id: "ME", category_name: "เนื้อสัตว์" },
      ]);
      console.log("Sample categories inserted!");
    } else {
      console.log("Data already exists, no need to insert.");
    }
    console.log("Category table was created !");
  })
  .catch((err) => {
    console.log(err);
  });

export default Category;
