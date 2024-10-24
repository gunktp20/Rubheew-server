import generatePayload from "promptpay-qr";
import QRCode from "qrcode";
import _ from "lodash";
import Order from "../models/Order.js";
import OrderItem from "../models/OrderItem.js";
import Vendor from "../models/Vendor.js";
import Menu from "../models/Menu.js";
import DeliveryCost from "../models/DeliveryCost.js";

const generateQR = async (req, res) => {
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
    ],
    order: [
      ["id", "ASC"], // สั่งลำดับการแสดงผล cart ตาม id (หรือตาม field อื่นที่ต้องการ)
      [{ model: OrderItem, as: "order_items" }, "id", "ASC"], // จัดลำดับ CartItem ภายในแต่ละ cart
    ],
  });

  if (!order) {
    return res.status(400).json({ msg: "ไม่พบออเดอร์ของคุณ" });
  }

  const shipping_fee = await DeliveryCost.findOne({});
  // const amount = parseFloat(_.get(req, ["body", "amount"]));
  const mobileNumber = order.vendor.prompt_pay;
  const amount = parseFloat(order.total_price + shipping_fee?.shipping_fee);
  const payload = generatePayload(mobileNumber, { amount });
  const option = {
    colors: {
      dark: "#000",
      light: " #fff",
    },
  };

  QRCode.toDataURL(payload, option, (err, url) => {
    if (err) {
      console.log("generate fail");
      return res.status(400).json({
        RespCode: 400,
        RespMessage: "bad : " + err,
      });
    } else {
      return res.status(200).json({
        RespCode: 400,
        RespMessage: "good",
        Result: url,
      });
    }
  });
};

export { generateQR };
