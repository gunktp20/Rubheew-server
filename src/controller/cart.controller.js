import Cart from "../models/Cart.js";
import CartItem from "../models/CartItem.js";
import Menu from "../models/Menu.js";
import Vendor from "../models/Vendor.js";

const insertItemToCart = async (req, res) => {
  const { vendor_id, menu_id, quantity } = req.body;

  const vendor = await Vendor.findOne({ where: { id: vendor_id } });
  if (!vendor) {
    return res.status(404).json({ msg: "ไม่พบร้านอาหารของคุณ" });
  }

  const menu = await Menu.findOne({ where: { id: menu_id, vendor_id } });
  if (!menu) {
    return res.status(404).json({ msg: "ไม่พบเมนูของคุณ" });
  }

  const cartAlreadyExists = await Cart.findOne({
    where: { vendor_id },
  });

  if (cartAlreadyExists) {
    // ตรวจสอบว่าเมนูที่ผู้ใช้เพิ่มมามีอยู่ใน ฐานข้อมูลแล้วหรือยัง
    const cartItemAlreadyExists = await CartItem.findOne({
      where: { menu_id },
    });
    if (cartItemAlreadyExists) {
      cartItemAlreadyExists.quantity =
        cartItemAlreadyExists.quantity + quantity;
      cartItemAlreadyExists.price =
        cartItemAlreadyExists.price + menu.price * quantity;
      await cartItemAlreadyExists.save();

      // ทำการคำนวณยอดรวมใน Cart อีกครั้ง
      cartAlreadyExists.total_price =
        cartAlreadyExists.total_price + menu.price * quantity;
      await cartAlreadyExists.save();
      return res.status(200).json({ msg: "เพิ่มอาหารของคุณลงตะกร้าเรียบร้อย" });
    }
    // หากยังไม่มีเมนูนั้นอยู่ แปลว่าจะเป็นการเพิ่ม CartItem ใหม่
    await CartItem.create({
      cart_id: cartAlreadyExists.id,
      menu_id,
      customer_id: req.user.id,
      vendor_id,
      quantity,
      price: menu.price * quantity,
    });

    cartAlreadyExists.total_price =
      cartAlreadyExists.total_price + menu.price * quantity;
    await cartAlreadyExists.save();

    return res.status(200).json({ msg: "เพิ่มอาหารของคุณลงตะกร้าเรียบร้อย" });
  }

  const cart = await Cart.create({
    customer_id: req.user.id,
    vendor_id,
    total_price: menu.price * quantity,
  });

  await CartItem.create({
    cart_id: cart.id,
    menu_id,
    vendor_id,
    quantity,
    customer_id:req.user.id,
    price: menu.price * quantity,
  });

  res.status(200).json({ msg: "เพิ่มอาหารของคุณลงตะกร้าเรียบร้อย" });
};

const getCarts = async (req, res) => {
  const carts = await Cart.findAll({
    where: {
      customer_id: req.user.id,
    },
    include: [
      {
        model: CartItem,
        as: "cart_items",
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
    ],
    order: [
      ["id", "ASC"], // สั่งลำดับการแสดงผล cart ตาม id (หรือตาม field อื่นที่ต้องการ)
      [{ model: CartItem, as: "cart_items" }, "id", "ASC"], // จัดลำดับ CartItem ภายในแต่ละ cart
    ],
  });

  const cartItems = await CartItem.findAll({
    where: {
      customer_id: req.user.id,
    },
  });

  return res.status(200).json({ carts, cartItemsNum: cartItems.length });
};

const getCartById = async (req, res) => {
  const cart = await Cart.findOne({
    where: {
      id: req.params.cart_id,
    },
    include: [
      {
        model: CartItem,
        as: "cart_items",
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
    ],
    order: [
      ["id", "ASC"], // สั่งลำดับการแสดงผล cart ตาม id (หรือตาม field อื่นที่ต้องการ)
      [{ model: CartItem, as: "cart_items" }, "id", "ASC"], // จัดลำดับ CartItem ภายในแต่ละ cart
    ],
  });

  if (!cart) {
    return res.status(404).json({ msg: "ไม่พบชุดรายการสินค้าของคุณ" });
  }

  return res.status(200).json(cart);
};

const deleteCartById = async (req, res) => {
  const { cart_id } = req.params;

  const isYourCart = await Cart.findOne({
    where: { id: cart_id, customer_id: req.user.id },
  });

  if (!isYourCart) {
    return res.status(401).json({ msg: "ขออภัยนี่ไม่ใช่ ตะกร้า สินค้าของคุณ" });
  }
  await Cart.destroy({
    where: { id: cart_id },
  });
  await CartItem.destroy({
    where: { cart_id },
  });

  const carts = await Cart.findAll({
    where: {
      customer_id: req.user.id,
    },
    include: [
      {
        model: CartItem,
        as: "cart_items",
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
    ],
    order: [
      ["id", "ASC"], // สั่งลำดับการแสดงผล cart ตาม id (หรือตาม field อื่นที่ต้องการ)
      [{ model: CartItem, as: "cart_items" }, "id", "ASC"], // จัดลำดับ CartItem ภายในแต่ละ cart
    ],
  });
  return res.status(200).json(carts);
};

export { insertItemToCart, getCarts, deleteCartById, getCartById };
