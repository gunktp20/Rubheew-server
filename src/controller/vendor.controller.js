import Vendor from "../models/Vendor.js";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { Op } from "sequelize";
import { resizeAndCompressVendorImage } from "../utils/imageProcessing.js";
import Menu from "../models/Menu.js";
import Category from "../models/Category.js";
import bcrypt from "bcrypt";
import Rider from "../models/Rider.js";
dotenv.config();

const comparePassword = async (password, storedHashedPassword) => {
  const isMatch = await bcrypt.compare(password, storedHashedPassword);
  return isMatch;
};

const register = async (req, res) => {
  const { username, vendor_name, phone_number, password, prompt_pay } =
    req.body;

  if (!req.file) {
    console.log("No file uploaded");
    return res.status(400).json({ msg: "กรุณาอัพโหลดรูปภาพเมนูอาหารของคุณ" });
  }

  if (!username || !vendor_name || !password || !phone_number || !prompt_pay) {
    return res.status(400).json({ msg: "กรุณากรอกข้อมูลให้ครบถ้วน" });
  }

  const salt = await bcrypt.genSalt(10);
  const encodedPassword = await bcrypt.hash(password, salt);

  const usernameTaken = await Vendor.findOne({ where: { username } });
  const vendorNameTaken = await Vendor.findOne({ where: { vendor_name } });

  // const phoneNumberAlreadyInUse = await Vendor.findOne({
  //   where: { phone_number },
  // });

  // if (phoneNumberAlreadyInUse) {
  //   return res
  //     .status(400)
  //     .json({ msg: "เบอร์โทรศัพท์ สำหรับร้านค้าของคุณถูกนำไปใช้งานแล้ว" });
  // }

  if (usernameTaken) {
    return res
      .status(400)
      .json({ msg: "Username สำหรับร้านค้าของคุณถูกนำไปใช้งานแล้ว" });
  }

  if (vendorNameTaken) {
    return res.status(400).json({ msg: "ชื่อร้านค้า ของคุณถูกนำไปใช้งานแล้ว" });
  }

  try {
    const processedFilename = await resizeAndCompressVendorImage(req.file);

    const newVendor = await Vendor.create({
      username,
      vendor_name,
      password: encodedPassword,
      phone_number,
      image: processedFilename,
      prompt_pay,
    });

    return res.status(200).json({ msg: "สมัครบัญชีสำหรับร้านค้าเสร็จสิ้น" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ msg: "บางอย่างผิดพลาด โปรดลองใหม่อีกครั้ง" });
  }
};

const login = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ msg: "กรุณากรอกข้อมูลให้ครบถ้วน" });
  }
  const vendor = await Vendor.findOne({ where: { username } });

  if (!vendor) {
    console.log("vendor");
    return res.status(401).json({ msg: "ชื่อผู้ใช้ หรือ รหัสผ่าน ไม่ถูกต้อง" });
  }

  if (vendor.verified == false) {
    return res.status(401).json({
      msg: "คุณยังไม่ได้สามารถเข้าสู่ระบบได้ กรุณารอผู้ดูแลอนุมัติก่อน",
    });
  }

  const isPasswordValid = await comparePassword(password, vendor.password);

  if (!isPasswordValid) {
    console.log("isPasswordValid");
    return res.status(401).json({ msg: "ชื่อผู้ใช้ หรือ รหัสผ่าน ไม่ถูกต้อง" });
  }

  const token = await jwt.sign(
    {
      id: vendor.id,
      username: vendor.username,
      role: "vendor",
    },
    process.env.JWT_SECRET_ACCESS,
    {
      expiresIn: "1d",
    }
  );
  res.status(200).json({ vendor, token });
};

const getAllVendors = async (req, res) => {
  // const { query } = req.query;
  // const vendors = await Vendor.findAll({
  //   where: {
  //     vendor_name: {
  //       [Op.like]: `%${query ? query : ""}%`,
  //     },
  //     verified: 1,
  //     open: 1,
  //   },
  //   attributes: ["id", "vendor_name", "phone_number", "open", "image"],
  // });

  const { query, category_id } = req.query;

  const vendorConditions = {
    vendor_name: {
      [Op.like]: `%${query ? query : ""}%`, // ค้นหาตาม keyword ที่ส่งมา
    },
    verified: 1,
    open: 1,
  };

  // หากมี category_id เพิ่มเงื่อนไขการเชื่อมกับ Menu และ Category
  const vendors = await Vendor.findAll({
    where: vendorConditions,
    attributes: ["id", "vendor_name", "phone_number", "open", "image"],
    include: category_id
      ? [
          {
            model: Menu, // เชื่อมกับ Menu
            required: true, // ต้องมี Menu ที่ตรงกับ category_id
            include: [
              {
                model: Category, // เชื่อมกับ Category
                where: {
                  id: category_id, // ใช้ category_id จาก query string
                },
                attributes: [], // ไม่ต้องดึงข้อมูลจาก Category (ลดข้อมูลที่ไม่จำเป็น)
              },
            ],
            attributes: [], // ไม่ต้องดึงข้อมูลจาก Menu (ลดข้อมูลที่ไม่จำเป็น)
          },
        ]
      : [], // ถ้าไม่มี category_id ก็ไม่เชื่อมกับ Menu และ Category
  });

  res.status(200).json(vendors);
};

const getVendorMenus = async (req, res) => {
  const menus = await Menu.findAll({
    where: {
      vendor_id: req.user.id,
    },
    include: [
      {
        model: Vendor,
        attributes: ["vendor_name", "phone_number", "open", "image"],
      },
      {
        model: Category,
        attributes: ["category_name"],
      },
    ],
  });
  res.status(200).json({ menus });
};

const getVendorInfo = async (req, res) => {
  const vendor = await Vendor.findOne({
    where: { id: req.params.vendor_id },
    attributes: ["id", "vendor_name", "phone_number", "open", "image","prompt_pay","description"],
  });

  if (!vendor) {
    return res.status(404).json({ msg: "ไม่พบร้านค้าของคุณ" });
  }
  res.status(200).json(vendor);
};

const updateVendorInfo = async (req, res) => {
  const { id } = req.params; // รับ id ของ Vendor ที่จะทำการอัปเดต
  const { phone_number, prompt_pay, description } = req.body; // รับค่า body ที่ส่งมา

  const vendor = await Vendor.findOne({ where: { id: req.user.id } });
  if (!vendor) {
    return res.status(400).json({ msg: "ไม่พบร้านค้าของคุณ" });
  }
  try {
    // สร้างอ็อบเจกต์สำหรับอัปเดตโดยเช็คว่ามีค่าไหนส่งมาบ้าง
    const updateFields = {};

    if (phone_number) {
      updateFields.phone_number = phone_number;
    }

    if (prompt_pay) {
      updateFields.prompt_pay = prompt_pay;
    }

    if (description) {
      updateFields.description = description;
    }

    // เช็คว่ามีค่าอะไรส่งมาหรือไม่ ถ้ามีค่อยอัปเดต
    if (Object.keys(updateFields).length > 0) {
      const updatedVendor = await Vendor.update(updateFields, {
        where: { id: req.user.id }, // เงื่อนไขการอัปเดตตาม id
      });

      if (updatedVendor[0] > 0) {
        // เช็คว่าอัปเดตสำเร็จหรือไม่
        return res.status(200).json({ msg: "อัปเดตร้านค้าสำเร็จ" });
      } else {
        return res.status(404).json({ msg: "ไม่พบข้อมูลร้านค้า" });
      }
    } else {
      return res.status(400).json({ msg: "ไม่มีข้อมูลที่ต้องการอัปเดต" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: "เกิดข้อผิดพลาดในระบบ" });
  }
};

const toggleOpen = async (req, res) => {
  const vendor = await Vendor.findOne({ where: { id: req.user.id } });

  if (!vendor) {
    return res.status(404).json({ msg: "ไม่พบร้านค้าของคุณ" });
  }
  await Vendor.update(
    {
      open: !vendor.open,
    },
    { where: { id: req.user.id } }
  );
  res.status(200).json({ msg: "เปิด / ปิด " });
};

const insertRider = async (req, res) => {
  const { rider_id } = req.body;

  if (!rider_id) {
    return res.status(400).json({ msg: "กรุณากรอก ไอดีผู้ขับ" });
  }
  const hasRiderAlready = await Rider.findOne({
    where: { vendor_id: req.user.id },
  });

  if (hasRiderAlready) {
    return res.status(400).json({ msg: "ร้านของคุณมีผู้ขับอยู่แล้ว" });
  }

  const rider = await Rider.findOne({
    where: { id: rider_id },
  });

  if (rider.vendor_id) {
    return res.status(400).json({ msg: "ผู้ขับคนนี้มีร้านค้าอยู่แล้ว" });
  }

  await Rider.update({ vendor_id: req.user.id }, { where: { id: rider_id } });

  const riderInfo = await Rider.findOne({
    where: { vendor_id: req.user.id },
    attributes: ["id", "username", "fname", "lname", "phone_number"],
  });

  res.status(200).json(riderInfo);
};

const getRiderOfVendor = async (req, res) => {
  const rider = await Rider.findOne({
    where: { vendor_id: req.user.id },
    attributes: ["id", "username", "fname", "lname", "phone_number"],
  });

  if (!rider) {
    return res.status(400).json({ msg: "ไม่พบผู้ขับของคุณ" });
  }

  res.status(200).json(rider);
};

export {
  register,
  login,
  getAllVendors,
  getVendorInfo,
  updateVendorInfo,
  toggleOpen,
  getVendorMenus,
  // rider
  insertRider,
  getRiderOfVendor,
};
