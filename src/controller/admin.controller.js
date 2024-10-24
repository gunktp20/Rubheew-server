import bcrypt from "bcrypt";
import Admin from "../models/Admin.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import Menu from "../models/Menu.js";
import Vendor from "../models/Vendor.js";
import Customer from "../models/Customer.js";
import CartItem from "../models/CartItem.js";
import Cart from "../models/Cart.js";
import OrderItem from "../models/OrderItem.js";
import Order from "../models/Order.js";
import Promotion from "../models/Promotions.js";
dotenv.config();

const comparePassword = async (password, storedHashedPassword) => {
  const isMatch = await bcrypt.compare(password, storedHashedPassword);
  return isMatch;
};

const login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ msg: "กรุณากรอกข้อมูลให้ครบถ้วน" });
  }

  const admin = await Admin.findOne({ where: { username } });
  if (!admin) {
    return res.status(401).json({ msg: "ชื่อผู้ใช้ หรือ รหัสผ่าน ไม่ถูกต้อง" });
  }

  const isPasswordValid = await comparePassword(password, admin.password);
  if (!isPasswordValid) {
    return res.status(401).json({ msg: "ชื่อผู้ใช้ หรือ รหัสผ่าน ไม่ถูกต้อง" });
  }

  const token = await jwt.sign(
    {
      id: admin.id,
      username: admin.username,
      role: "admin",
    },
    process.env.JWT_SECRET_ACCESS,
    {
      expiresIn: "1d",
    }
  );

  res.status(200).json({
    user: {
      id: admin.id,
      username: admin.username,
    },
    token,
    admin: {
      id: admin.id,
      username: admin.username,
    },
  });
};

const getVendorsRegistrations = async (req, res) => {
  const vendorsRegistrations = await Vendor.findAll({
    where: { verified: false },
  });

  return res.status(200).json(vendorsRegistrations);
};
const getVendors = async (req, res) => {
  const vendors = await Vendor.findAll({
    where: { verified: true },
  });

  return res.status(200).json(vendors);
};

// menu operation
const deleteMenu = async (req, res) => {
  const menu = await Menu.findOne({ where: { id: req.params.menu_id } });
  if (!menu) {
    return res.status(400).json({ msg: "ไม่พบเมนูของคุณ" });
  }

  const cartItemsToDelete = await CartItem.findAll({
    where: { menu_id: req.params.menu_id },
  });

  for (const cartItem of cartItemsToDelete) {
    await cartItem.destroy();
  }

  await Menu.destroy({ where: { id: req.params.menu_id } });

  await menu.destroy();

  res.status(200).json({ msg: "ลบเมนูของคุณเสร็จสิ้น" });
};

const deleteVendor = async (req, res) => {
  const vendor = await Vendor.findOne({ where: { id: req.params.vendor_id } });
  if (!vendor) {
    return res.status(400).json({ msg: "ไม่พบร้านค้าของคุณ" });
  }
  const cartItemsToDelete = await CartItem.findAll({
    where: { vendor_id: req.params.vendor_id },
  });
  for (const cartItem of cartItemsToDelete) {
    await cartItem.destroy();
  }

  await Menu.destroy({ where: { vendor_id: vendor.id } });
  await Cart.destroy({ where: { vendor_id: req.params.vendor_id } });
  await OrderItem.destroy({ where: { vendor_id: req.params.vendor_id } });
  await Order.destroy({ where: { vendor_id: req.params.vendor_id } });
  await vendor.destroy();

  res.status(200).json({ msg: "ลบร้านค้าของคุณเสร็จสิ้น" });
};

const approveVendor = async (req, res) => {
  const vendor = await Vendor.findOne({ where: { id: req.params.vendor_id } });
  if (!vendor) {
    return res.status(400).json({ msg: "ไม่พบร้านค้าของคุณ" });
  }
  vendor.verified = true;
  await vendor.save();

  res.status(200).json({ msg: "อนุมัติร้านค้าของคุณเสร็จสิ้น" });
};

const getAllCustomers = async (req, res) => {
  const customers = await Customer.findAll();

  res.status(200).json(customers);
};

const banCustomer = async (req, res) => {
  const { customer_id } = req.body;
  const customer = await Customer.findOne({ where: { id: customer_id } });

  if (!customer) {
    return res.status(400).json({ msg: "ไม่พบบัญชีลูกค้าของคุณ" });
  }

  customer.banned = true;
  await customer.save();
};

export {
  login,
  deleteMenu,
  deleteVendor,
  approveVendor,
  getAllCustomers,
  banCustomer,
  getVendorsRegistrations,
  getVendors,
};
