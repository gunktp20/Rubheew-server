import Category from "../models/Category.js";
import Menu from "../models/Menu.js";
import Vendor from "../models/Vendor.js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import fs from "fs";
import { resizeAndCompressImage } from "../utils/imageProcessing.js";
import CartItem from "../models/CartItem.js";
import Cart from "../models/Cart.js";
import { where } from "sequelize";
import OrderItem from "../models/OrderItem.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const insertMenu = async (req, res) => {
  const { menu_name, category_id, price } = req.body;

  if (!req.file) {
    console.log("No file uploaded");
    return res.status(400).json({ msg: "กรุณาอัพโหลดรูปภาพเมนูอาหารของคุณ" });
  }

  if (!menu_name || !category_id || !req.user.id || !price || price <= 0) {
    return res.status(400).json({ msg: "กรุณากรอกข้อมูลให้ครบถ้วน" });
  }

  const category = await Category.findOne({ where: { id: category_id } });

  if (!category) {
    return res.status(404).json({ msg: "ไม่พบประเภทอาหารที่คุณเลือก" });
  }

  const vendor = await Vendor.findOne({ where: { id: req.user.id } });

  if (!vendor) {
    return res.status(404).json({ msg: "ไม่พบร้านค้าของคุณ" });
  }

  const isMenuTaken = await Menu.findOne({ where: { menu_name } });
  if (isMenuTaken) {
    return res
      .status(400)
      .json({ msg: "ชื่อเมนูของคุณ มีอยู่ในร้านของคุณแล้ว" });
  }

  const processedFilename = await resizeAndCompressImage(req.file);

  await Menu.create({
    menu_name,
    category_id,
    vendor_id: req.user.id,
    price,
    image: processedFilename,
  });

  res.status(200).json({ msg: "เพิ่มเมนูของคุณเสร็จสิ้น" });
};

const getAllMenu = async (req, res) => {
  const menus = await Menu.findAll({
    include: [
      {
        model: Vendor,
        attributes: ["vendor_name", "phone_number", "open"],
      },
      {
        model: Category,
        attributes: ["category_name"],
      },
    ],
  });

  res.status(200).json({ menus });
};

const getMenuInfoById = async (req, res) => {
  const menu = await Menu.findOne({
    where: { id: req.params.menu_id },
    include: [
      {
        model: Vendor,
        attributes: ["vendor_name", "phone_number", "open"],
      },
      {
        model: Category,
        attributes: ["category_name"],
      },
    ],
  });

  if (!menu) {
    return res.status(404).json({ msg: "ไม่พบเมนูของคุณ" });
  }

  res.status(200).json(menu);
};

const getAllMenuByVendorId = async (req, res) => {
  const vendor = await Vendor.findOne({ where: { id: req.params.vendor_id } });
  if (!vendor) {
    return res.status(404).json({ msg: "ไม่พบร้านค้าของคุณ" });
  }

  if (!vendor.open) {
    return res.status(404).json({ msg: "ขออภัยร้านกำลังปิดให้บริการ" });
  }

  const menus = await Menu.findAll({
    where: {
      vendor_id: req.params.vendor_id,
    },
    include: [
      {
        model: Vendor,
        attributes: ["vendor_name", "phone_number", "open"],
      },
      {
        model: Category,
        attributes: ["category_name"],
      },
    ],
  });

  res.status(200).json({ menus });
};

const updateMenuById = async (req, res) => {
  const { menu_name, category_id, price } = req.body;

  // if (!req.file) {
  //   console.log("No file uploaded");
  //   return res.status(400).json({ msg: "กรุณาอัพโหลดรูปภาพเมนูอาหารของคุณ" });
  // }

  if (!menu_name || !category_id || !req.user.id || !price || price <= 0) {
    return res.status(400).json({ msg: "กรุณากรอกข้อมูลให้ครบถ้วน" });
  }

  const category = await Category.findOne({ where: { id: category_id } });

  if (!category) {
    return res.status(404).json({ msg: "ไม่พบประเภทอาหารที่คุณเลือก" });
  }
  // เช็คก่อนว่า Menu นี้กำลังถูกใช้อยู่ใน ตะกร้าหรือ Order หรือไม่เพื่อป้องกันปัญหาที่จะเกิดขึ้น
  const isCartItemsInUse = await CartItem.findAll({
    where: { menu_id: req.params.menu_id },
  });
  if (isCartItemsInUse > 0) {
    return res.status(400).json({
      msg: "เมนูที่คุณกำลังจะอัพเดทเชื่อมโยงอยู่กับในหลายรายการ กรุณารอให้ผู้ใช้ Checkout ออกไปก่อน",
    });
  }

  const isOrdersInUse = await OrderItem.findAll({
    where: { menu_id: req.params.menu_id },
  });
  if (isOrdersInUse > 0) {
    return res.status(400).json({
      msg: "เมนูที่คุณกำลังจะอัพเดทเชื่อมโยงอยู่กับในหลายรายการ กรุณารอให้ผู้ใช้ Checkout ออกไปก่อน",
    });
  }

  const isYourVendor = await Menu.findOne({
    where: { id: req.params.menu_id, vendor_id: req.user?.id },
  });

  const menu_info = await Menu.findOne({
    where: { id: req.params.menu_id },
  });

  if (!isYourVendor) {
    return res.status(400).json({ msg: "ไม่ใช่ เมนู ในร้านของคุณ" });
  }

  if (req.file) {
    fs.unlink(`../uploads/menus/${menu_info.image}`, (err) => {
      if (err) {
        console.error("Error occurred while deleting the file:", err);
        return;
      }
      console.log("File deleted successfully");
    });

    const processedFilename = await resizeAndCompressImage(req.file);

    await Menu.update(
      {
        menu_name,
        category_id,
        price,
        image: processedFilename,
      },
      { where: { id: req.params.menu_id } }
    );

    return res
      .status(200)
      .json({ msg: "แก้ไขรายละเอียดเมนูของคุณ เรียบร้อยแล้ว" });
  }

  await Menu.update(
    {
      menu_name,
      category_id,
      price,
    },
    { where: { id: req.params.menu_id } }
  );

  res.status(200).json({ msg: "แก้ไขรายละเอียดเมนูของคุณ เรียบร้อยแล้ว" });
};

const deleteMenuById = async (req, res) => {
  const { menu_id } = req.params;

  const isYourMenu = await Menu.findOne({
    where: { id: menu_id, vendor_id: req.user.id },
  });

  if (!isYourMenu) {
    return res.status(401).json({ msg: "ขออภัยนี่ไม่ใช่ เมนู ของคุณ" });
  }

  const cartItemsToDelete = await CartItem.findAll({
    where: { menu_id: menu_id },
  });

  for (const cartItem of cartItemsToDelete) {
    await cartItem.destroy();
  }

  await Menu.destroy({ where: { id: menu_id } });

  const menus = await Menu.findAll({
    where: {
      vendor_id: req.user.id,
    },
    include: [
      {
        model: Vendor,
        attributes: ["vendor_name", "phone_number", "open"],
      },
      {
        model: Category,
        attributes: ["category_name"],
      },
    ],
  });

  res.status(200).json({ menus });
};

export {
  insertMenu,
  getAllMenu,
  getAllMenuByVendorId,
  getMenuInfoById,
  updateMenuById,
  deleteMenuById,
};
