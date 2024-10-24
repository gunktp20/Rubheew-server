import { DataTypes } from "sequelize";
import sequelize from "../db/connection.js";

const Destination = sequelize.define("destinations", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  destination_name: {
    type: DataTypes.STRING,
    unique: true,
  },
  lat: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  lng: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

Destination.sync({ force: false })
  .then(async () => {
    // ตรวจสอบว่าตารางยังไม่มีข้อมูล เพื่อป้องกันไม่ให้ insert ซ้ำ
    const count = await Destination.count();
    if (count === 0) {
      // Insert ข้อมูลอัตโนมัติเมื่อสร้างตารางใหม่
      await Destination.bulkCreate([
        {
          destination_name: "ตลาดน้ำอัมพวา",
          lat: "13.4258",
          lng: "99.9533",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          destination_name: "สะพานมอญ สังขละบุรี",
          lat: "15.1542",
          lng: "98.4454",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          destination_name: "พระบรมมหาราชวัง",
          lat: "13.7500",
          lng: "100.4910",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          destination_name: "อุทยานประวัติศาสตร์พระนครศรีอยุธยา",
          lat: "14.3588",
          lng: "100.5664",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          destination_name: "เกาะล้าน",
          lat: "12.9229",
          lng: "100.7850",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          destination_name: "ถนนคนเดินเชียงคาน",
          lat: "17.8971",
          lng: "101.6444",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          destination_name: "สะพานข้ามแม่น้ำแคว",
          lat: "14.0400",
          lng: "99.5035",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          destination_name: "เขาตะเกียบ",
          lat: "12.5177",
          lng: "99.9710",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          destination_name: "ถ้ำพระยานคร",
          lat: "12.1719",
          lng: "99.9219",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          destination_name: "ตลาดโต้รุ่งหัวหิน",
          lat: "12.5694",
          lng: "99.9534",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        // เพิ่มข้อมูลอื่น ๆ ที่คุณต้องการ insert
      ]);
      console.log("Sample destinations inserted!");
    } else {
      console.log("Data already exists, no need to insert.");
    }

    console.log("Destination table was created !");
  })
  .catch((err) => {
    console.log(err);
  });

export default Destination;
