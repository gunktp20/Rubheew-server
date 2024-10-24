import Cart from "../models/Cart.js";
import CartItem from "../models/CartItem.js";
import Customer from "../models/Customer.js";
import Destination from "../models/Destination.js";
import Menu from "../models/Menu.js";
import Order from "../models/Order.js";
import OrderItem from "../models/OrderItem.js";
import Vendor from "../models/Vendor.js";
import Rider from "../models/Rider.js";
import fs from "fs";
import {
  resizeAndCompressDeliveryImage,
  resizeAndCompressSlipImage,
} from "../utils/imageProcessing.js";
import Sequelize from "sequelize"

const createOrder = async (req, res) => {
  const { cart_id } = req.params;
  const { destination_id, note } = req.body;

  if (!cart_id) {
    return res.status(400).json({ msg: "กรุณากรอกข้อมูลให้ครบถ้วน" });
  }

  if (!destination_id) {
    return res.status(400).json({ msg: "กรุณากรอกข้อมูลให้ครบถ้วน" });
  }

  const cart = await Cart.findOne({
    where: { id: cart_id, customer_id: req.user.id },
  });

  if (!cart) {
    return res.status(404).json({ msg: "ไม่พบชุดรายการของคุณ" });
  }

  const cartItems = await CartItem.findAll({
    where: { cart_id },
  });

  if (cartItems.length === 0) {
    return res.status(400).json({ msg: "ตะกร้าของคุณว่างเปล่า" });
  }

  const order = await Order.create({
    customer_id: req.user.id,
    vendor_id: cart.vendor_id,
    total_price: cart.total_price,
    note: note ? note : null,
    status: "pending",
    destination_id,
  });

  await Cart.destroy({ where: { id: cart_id } });

  for (const cartItem of cartItems) {
    await OrderItem.create({
      order_id: order.id, // ใส่ order_id ของ Order ที่สร้างใหม่
      menu_id: cartItem.menu_id,
      vendor_id: cartItem.vendor_id,
      quantity: cartItem.quantity,
      price: cartItem.price,
    });

    await CartItem.destroy({ where: { cart_id: cart.id } });
  }

  res.status(200).json(order);

  //   for (const cartItem of cartItems) {
  //     await OrderItem.create({
  //       order_id: order.id,
  //       menu_id: cartItem.menu_id,
  //       quantity: cartItem.quantity,
  //       price: cartItem.price,
  //     });

  //     await cartItem.destroy();
  //   }
};

const getOrderInfoById = async (req, res) => {
  const { order_id } = req.params;
  const order = await Order.findOne({
    where: {
      id: order_id,
      customer_id: req.user.id,
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

  if (order.customer_id !== req.user.id) {
    return res.status(400).json({ msg: "ไม่พบออเดอร์ของคุณ" });
  }

  return res.status(200).json(order);
};

const checkoutOrder = async (req, res) => {
  if (!req.file) {
    console.log("No file uploaded");
    return res.status(400).json({ msg: "กรุณาอัพโหลดรูปภาพเมนูอาหารของคุณ" });
  }

  const order = await Order.findOne({ where: { id: req.params.order_id } });

  if (!order) {
    return res.status(400).json({ msg: "ไม่พบออเดอร์ของคุณ" });
  }

  if (order.slip_image) {
    await fs.unlink(`../uploads/slips/${order.slip_image}`, (err) => {
      if (err) {
        console.error("Error occurred while deleting the file:", err);
        return;
      }
      console.log("File deleted successfully");
    });
  }

  const processedFilename = await resizeAndCompressSlipImage(req.file);

  await Order.update(
    { slip_image: processedFilename },
    { where: { id: req.params.order_id } }
  );

  const orders = await Order.findAll({
    where: {
      vendor_id: req.user.id,
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
        model: Destination,
        attributes: ["id", "destination_name"],
      },
      {
        model: Customer,
        attributes: ["id", "username", "fname", "lname"],
      },
    ],
    order: [
      ["id", "ASC"], // สั่งลำดับการแสดงผล cart ตาม id (หรือตาม field อื่นที่ต้องการ)
      [{ model: OrderItem, as: "order_items" }, "id", "ASC"], // จัดลำดับ CartItem ภายในแต่ละ cart
    ],
  });

  if (!orders) {
    return res.status(400).json({ msg: "ไม่พบออเดอร์ของคุณ" });
  }

  return res.status(200).json(orders);
};

const getOrdersVendor = async (req, res) => {
  const orders = await Order.findAll({
    where: {
      vendor_id: req.user.id,
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
        model: Destination,
        attributes: ["id", "destination_name"],
      },
      {
        model: Customer,
        attributes: ["id", "username", "fname", "lname"],
      },
    ],
    order: [
      // สั่งลำดับ order ตามลำดับสถานะที่กำหนด
      [
        Sequelize.literal(`
          CASE 
            WHEN status = 'pending' THEN 1
            WHEN status = 'preparing' THEN 2
            WHEN status = 'out_for_delivery' THEN 3
            WHEN status = 'delivered' THEN 4
            ELSE 5
          END
        `),
        "ASC"
      ],
      ["id", "ASC"], // สั่งลำดับ order ตาม id
      [{ model: OrderItem, as: "order_items" }, "id", "ASC"], // จัดลำดับ OrderItem ภายในแต่ละ Order
    ],
    
  });

  if (!orders) {
    return res.status(400).json({ msg: "ไม่พบออเดอร์ของคุณ" });
  }

  res.status(200).json(orders);
};

const getOrderVendorInfoById = async (req, res) => {
  const { order_id } = req.params;
  const order = await Order.findOne({
    where: {
      id: order_id,
      vendor_id: req.user.id,
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
      },
    ],
    order: [
      ["id", "ASC"], // สั่งลำดับการแสดงผล cart ตาม id (หรือตาม field อื่นที่ต้องการ)
      [{ model: OrderItem, as: "order_items" }, "id", "ASC"], // จัดลำดับ CartItem ภายในแต่ละ cart
    ],
  });

  if (!order) {
    console.log("!order");
    return res.status(400).json({ msg: "ไม่พบออเดอร์ของคุณ" });
  }

  if (order.vendor_id !== req.user.id) {
    console.log("!order req.user.id");
    return res.status(400).json({ msg: "ไม่พบออเดอร์ของคุณ" });
  }

  return res.status(200).json(order);
};

const confirmOrder = async (req, res) => {
  const { order_id } = req.params;

  const order = await Order.findOne({
    where: { id: order_id, vendor_id: req.user.id },
  });
  if (!order) {
    return res.status(404).json({ msg: "ไม่พบออเดอร์ของคุณ" });
  }
  order.status = "preparing";
  await order.save();

  res.status(200).json({ msg: "ยืนยันออเดอร์ของคุณแล้ว" });

  // "pending",
  // "confirmed",
  // "preparing",
  // "out_for_delivery",
  // "delivered",
  // "cancelled"
};

const moveToRider = async (req, res) => {
  const { order_id } = req.params;

  const order = await Order.findOne({
    where: { id: order_id, vendor_id: req.user.id },
  });
  if (!order) {
    return res.status(404).json({ msg: "ไม่พบออเดอร์ของคุณ" });
  }
  const riderAvailable = await Rider.findOne({
    where: { vendor_id: req.user.id },
  });
  if (!riderAvailable) {
    return res.status(404).json({ msg: "ร้านของคุณยังไม่มีผู้ขับ" });
  }

  order.status = "out_for_delivery";
  order.rider_id = riderAvailable.id;
  await order.save();

  res.status(200).json({ msg: "กำลังดำเนินการออเดอร์ของคุณ" });
};

const rejectOrder = async (req, res) => {
  const { order_id } = req.params;

  const order = await Order.findOne({
    where: { id: order_id, vendor_id: req.user.id },
  });
  if (!order) {
    return res.status(404).json({ msg: "ไม่พบออเดอร์ของคุณ" });
  }

  if (!order) {
    return res.status(404).json({ msg: "ไม่พบออเดอร์ของคุณ" });
  }
  order.status = "preparing";
  await order.save();

  res.status(200).json({ msg: "กำลังดำเนินการออเดอร์ของคุณ" });
};

const getOrders = async (req, res) => {
  const orders = await Order.findAll({
    where: {
      customer_id: req.user.id,
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
        model: Destination,
        attributes: ["id", "destination_name"],
      },
      {
        model: Customer,
        attributes: ["id", "username", "fname", "lname"],
      },
    ],
    order: [
      // สั่งลำดับ order ตามลำดับสถานะที่กำหนด
      [
        Sequelize.literal(`
          CASE 
            WHEN status = 'pending' THEN 1
            WHEN status = 'preparing' THEN 2
            WHEN status = 'out_for_delivery' THEN 3
            WHEN status = 'delivered' THEN 4
            ELSE 5
          END
        `),
        "ASC"
      ],
      ["id", "ASC"], // สั่งลำดับ order ตาม id
      [{ model: OrderItem, as: "order_items" }, "id", "ASC"], // จัดลำดับ OrderItem ภายในแต่ละ Order
    ],
  });

  res.status(200).json(orders);
};

const deleteOrder = async (req, res) => {
  const { order_id } = req.params;

  const order = await Order.findOne({
    where: { id: order_id, vendor_id: req.user.id },
  });
  if (!order) {
    return res.status(404).json({ msg: "ไม่พบออเดอร์ของคุณ" });
  }
  await order.destroy();

  res.status(200).json({ msg: "ลบออเดอร์ของคุณเสร็จสิ้น" });
};

const getRiderOrders = async (req, res) => {
  const orders = await Order.findAll({
    where: {
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
        model: Destination,
        attributes: ["id", "destination_name"],
      },
      {
        model: Customer,
        attributes: ["id", "username", "fname", "lname"],
      },
    ],
    order: [
      // สั่งลำดับ order ตามลำดับสถานะที่กำหนด
      [
        Sequelize.literal(`
          CASE 
            WHEN status = 'pending' THEN 1
            WHEN status = 'preparing' THEN 2
            WHEN status = 'out_for_delivery' THEN 3
            WHEN status = 'delivered' THEN 4
            ELSE 5
          END
        `),
        "ASC"
      ],
      ["id", "ASC"], // สั่งลำดับ order ตาม id
      [{ model: OrderItem, as: "order_items" }, "id", "ASC"], // จัดลำดับ OrderItem ภายในแต่ละ Order
    ],
  });

  res.status(200).json(orders);
};

const completeOrderWithImage = async (req, res) => {
  const order = await Order.findOne({
    where: { id: req.params.order_id, rider_id: req.user.id },
  });

  if (!order) {
    return res.status(400).json({ msg: "ไม่พบออเดอร์ของคุณ" });
  }

  if (order.status === "delivered") {
    return res.status(400).json({ msg: "ออเดอร์ของคุณถูกส่งสำเร็จไปแล้ว" });
  }

  if (!req.file) {
    console.log("No file uploaded");
    return res
      .status(400)
      .json({ msg: "กรุณาอัพโหลดรูปภาพเมนูยืนยันการส่งของคุณ" });
  }

  const processedFilename = await resizeAndCompressDeliveryImage(req.file);
  order.delivery_image = processedFilename;
  order.status = "delivered";
  await order.save();

  res.status(200).json({ msg: "ออเดอร์ของคุณถูกส่งสำเร็จ" });
};

const getPendingOrdersVendorNumber = async (req, res) => {
  const count = await Order.count({
    where: {
      vendor_id: req.user.id,
      status: "pending",
    },
  });
  res.status(200).json(count);
};

export {
  createOrder,
  getOrderInfoById,
  checkoutOrder,
  getOrdersVendor,
  getOrderVendorInfoById,
  getOrders,
  // vendor operations
  confirmOrder,
  rejectOrder,
  moveToRider,
  deleteOrder,
  // rider
  getRiderOrders,
  completeOrderWithImage,
  getPendingOrdersVendorNumber,
};
