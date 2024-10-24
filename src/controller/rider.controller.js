import bcrypt from "bcrypt";
import Rider from "../models/Rider.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import Order from "../models/Order.js";
import Menu from "../models/Menu.js";
import Vendor from "../models/Vendor.js";
import Destination from "../models/Destination.js";
import OrderItem from "../models/OrderItem.js";
import Customer from "../models/Customer.js";

dotenv.config();

const comparePassword = async (password, storedHashedPassword) => {
  const isMatch = await bcrypt.compare(password, storedHashedPassword);
  return isMatch;
};

const register = async (req, res) => {
  const { username, fname, lname, password, phone_number } = req.body;
  if (!username || !fname || !lname || !password || !phone_number) {
    return res.status(400).json({ msg: "กรุณากรอกข้อมูลให้ครบถ้วน" });
  }

  const rider = await Rider.findOne({ where: { username } });
  if (rider) {
    return res.status(400).json({ msg: "ชื่อผู้ใช้ของคุณถูกนำไปใช้แล้ว" });
  }

  const isPhoneNumberUsed = await Rider.findOne({ where: { phone_number } });
  if (isPhoneNumberUsed) {
    return res.status(400).json({ msg: "เบอร์ติดต่อของคุณถูกนำไปใช้แล้ว" });
  }
  const salt = await bcrypt.genSalt(10);
  const encodedPassword = await bcrypt.hash(password, salt);

  await Rider.create({
    username,
    fname,
    lname,
    password: encodedPassword,
    phone_number,
  });

  res.status(200).json({ msg: "สมัครสมาชิกสำหรับคนขับของคุณเสร็จสิ้น" });
};

const login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ msg: "กรุณากรอกข้อมูลให้ครบถ้วน" });
  }

  const rider = await Rider.findOne({ where: { username } });

  if (!rider) {
    console.log("! rider");
    return res.status(401).json({ msg: "ชื่อผู้ใช้ หรือ รหัสผ่าน ไม่ถูกต้อง" });
  }

  const isPasswordValid = await comparePassword(password, rider.password);

  if (!isPasswordValid) {
    console.log("! isPasswordValid");
    return res.status(401).json({ msg: "ชื่อผู้ใช้ หรือ รหัสผ่าน ไม่ถูกต้อง" });
  }

  const token = await jwt.sign(
    {
      id: rider.id,
      username: rider.username,
      role: "rider",
    },
    process.env.JWT_SECRET_ACCESS,
    {
      expiresIn: "1d",
    }
  );

  res.status(200).json({ rider, token });
};

const getAllRiders = async (req, res) => {
  const riders = await Rider.findAll({
    where: {},
    attributes: ["id", "fname", "lname", "username", "phone_number"],
  });
  res.status(200).json(riders);
};

const deleteVendorRider = async (req, res) => {
  const { rider_id } = req.params;

  const rider = await Rider.findOne({
    where: { id: rider_id, vendor_id: req.user.id },
  });
  if (!rider) {
    return res.status(400).json({ msg: "ไม่พบผู้ขับของคุณ" });
  }

  rider.vendor_id = null;
  await rider.save();
  return res.status(200).json({ msg: "นำไรผู้ขับออกจากร้านของคุณเสร็จสิ้น" });
};

const getOrderRiderById = async (req, res) => {
  const { order_id } = req.params;

  const order = await Order.findOne({
    where: {
      id: order_id,
      rider_id: req.user.id,
    },
    include: [
      {
        model: OrderItem,
        as: "order_items",
        required: false,
        include: [
          {
            model: Menu, // เชื่อมตาราง Menu ผ่าน CartItem
            attributes: ["menu_name", "image", "id", "price"], // ตัวอย่าง attributes ของ Menu
          },
        ],
      },
      {
        model: Vendor,
        attributes: ["vendor_name", "image", "open", "phone_number"],
      },
      {
        model: Customer,
        attributes: ["id", "fname", "lname", "phone_number"],
      },
      {
        model: Destination,
        attributes: ["id", "destination_name", "lat", "lng"],
      },
    ],
    order: [
      ["id", "ASC"], // สั่งลำดับการแสดงผล cart ตาม id (หรือตาม field อื่นที่ต้องการ)
      [{ model: OrderItem, as: "order_items" }, "id", "ASC"], // จัดลำดับ CartItem ภายในแต่ละ cart
    ],
  });

  if (!order) {
    return res.status(400).json({ msg: "ไม่พบออเดอร์ของคุณ" });
  }

  return res.status(200).json(order);
};

export { register, login, getAllRiders, deleteVendorRider, getOrderRiderById };
