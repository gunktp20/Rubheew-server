import Cart from "../models/Cart.js";
import CartItem from "../models/CartItem.js";
import Menu from "../models/Menu.js";
import Vendor from "../models/Vendor.js";

const increaseCartItem = async (req, res) => {
  const { cart_item_id } = req.params;

  if (!cart_item_id) {
    return res.status(400).json({ msg: "กรุณากรอกข้อมูลให้ครบถ้วน" });
  }

  const cartItem = await CartItem.findOne({
    where: { id: cart_item_id },
  });

  const menu = await Menu.findOne({
    where: { id: cartItem.menu_id },
  });

  if (!cartItem) {
    return res.status(404).json({ msg: "ไม่พบรายการสินค้าของคุณ" });
  }

  const isYourCartItem = await Cart.findOne({
    where: { customer_id: req.user.id, id: cartItem.cart_id },
  });

  if (!isYourCartItem) {
    return res.status(404).json({ msg: "ไม่พบรายการสินค้าของคุณ" });
  }

  cartItem.quantity = cartItem.quantity + 1;
  cartItem.price = cartItem.price + menu.price;
  await cartItem.save();

  await Cart.update(
    {
      total_price: isYourCartItem.total_price + menu.price,
    },
    {
      where: {
        id: isYourCartItem.id,
      },
    }
  );

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
// bug *
const decreaseCartItem = async (req, res) => {
  const { cart_item_id } = req.params;

  if (!cart_item_id) {
    return res.status(400).json({ msg: "กรุณากรอกข้อมูลให้ครบถ้วน" });
  }

  const cartItem = await CartItem.findOne({
    where: { id: cart_item_id },
  });

  const menu = await Menu.findOne({
    where: { id: cartItem.menu_id },
  });

  if (!cartItem) {
    return res.status(404).json({ msg: "ไม่พบรายการสินค้าของคุณ" });
  }

  const isYourCartItem = await Cart.findOne({
    where: { customer_id: req.user.id, id: cartItem.cart_id },
  });

  if (!isYourCartItem) {
    return res.status(404).json({ msg: "ไม่พบรายการสินค้าของคุณ" });
  }

  if (cartItem.quantity === 1) {
    await cartItem.destroy();
    // console.log("cartItem . quantity")
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
  }

  console.log('dddd')
  cartItem.quantity = cartItem.quantity - 1;

  cartItem.price = cartItem.price - menu.price;

  await cartItem.save();

  await Cart.update(
    {
      total_price: isYourCartItem.total_price - menu.price,
    },
    {
      where: {
        id: isYourCartItem.id,
      },
    }
  );

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
// bug *
const deleteCartItem = async (req, res) => {
  const { cart_item_id } = req.params;

  if (!cart_item_id) {
    return res.status(400).json({ msg: "กรุณากรอกข้อมูลให้ครบถ้วน" });
  }

  const cartItem = await CartItem.findOne({
    where: { id: cart_item_id },
  });

  if (!cartItem) {
    return res.status(404).json({ msg: "ไม่พบรายการสินค้าของคุณ" });
  }

  const isYourCartItem = await Cart.findOne({
    where: { customer_id: req.user.id, id: cartItem.cart_id },
  });

  if (!isYourCartItem) {
    return res.status(404).json({ msg: "ไม่พบรายการสินค้าของคุณ" });
  }

  await cartItem.destroy();

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

const getCartItemsNumber = async (req, res) => {
  const totalQuantity = await CartItem.sum("quantity", {
    where: { customer_id: req.user.id },
  });
  res.status(200).json(totalQuantity);
};

export {
  increaseCartItem,
  decreaseCartItem,
  deleteCartItem,
  getCartItemsNumber,
};
