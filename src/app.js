import express from "express";
import cors from "cors";
import sequelize from "./db/connection.js";
import dotenv from "dotenv";
import http from "http";
import customerRouter from "./routes/customer.router.js";
import vendorRouter from "./routes/vendor.router.js";
import menuRouter from "./routes/menu.router.js";
import cartRouter from "./routes/cart.router.js";
import cartItemRouter from "./routes/cart-item.router.js";
import destinationRouter from "./routes/destination.router.js";
import categoryRouter from "./routes/category.router.js";
import orderRouter from "./routes/order.router.js";
import riderRouter from "./routes/rider.router.js";
import paymentRouter from "./routes/payment.router.js";
import adminRouter from "./routes/admin.router.js";
import reportRouter from "./routes/report.router.js";
import promotionRouter from "./routes/promotion.router.js";
import deliveryCostRouter from "./routes/delivery-cost.router.js";

import Order from "./models/Order.js";
import Destination from "./models/Destination.js";
import CartItem from "./models/CartItem.js";
import Cart from "./models/Cart.js";
import DeliveryCost from "./models/DeliveryCost.js";
import { fileURLToPath } from "url";
import path, { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();
const app = express();

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

const orders = [
  {
    id: "10011",
    destination: "หอพัก The muse A",
    price: 185,
    phone_number: "081-234-5678",
    position: {
      lat: 14.02208605520346,
      lng: 99.99250628669407,
    },
  },
  {
    id: "10012",
    destination: "หอ นกฮูก 8",
    price: 151,
    phone_number: "086-987-6543",
    position: {
      lat: 14.02370095436186,
      lng: 99.99761805746458,
    },
  },
  {
    id: "10013",
    destination: "D-Condo",
    price: 310,
    phone_number: "089-555-1234",
    position: {
      lat: 14.022976969245889,
      lng: 99.99212905571123,
    },
  },
  { id: "10014", destination: "VS", price: 85, phone_number: "080-456-7890" },
  {
    id: "10015",
    destination: "บ้านอยู่สบาย",
    price: 98,
    phone_number: "084-321-0987",
    position: {
      lat: 14.02112391053382,
      lng: 99.99297452362285,
    },
  },
  {
    id: "10016",
    destination: "ม เกษตร",
    price: 310,
    phone_number: "085-123-4567",
    position: {
      lat: 14.021952142943354,
      lng: 99.99012384812518,
    },
  },
];

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/image/menu", express.static("src/uploads/menus"));
app.use("/image/slip", express.static("src/uploads/slips"));
app.use("/image/vendor", express.static("src/uploads/vendors"));
app.use("/image/delivery", express.static("src/uploads/delivery"));
app.use("/image/promotion", express.static("src/uploads/promotions"));

app.use("/customer", customerRouter);
app.use("/category", categoryRouter);
app.use("/destination", destinationRouter);
app.use("/cart", cartRouter);
app.use("/cart-item", cartItemRouter);
app.use("/vendor", vendorRouter);
app.use("/menu", menuRouter);
app.use("/order", orderRouter);
app.use("/rider", riderRouter);
app.use("/payment", paymentRouter);
app.use("/admin", adminRouter);
app.use("/report", reportRouter);
app.use("/delivery-cost", deliveryCostRouter);
app.use("/promotion", promotionRouter);

app.get("/test-order/:id", async (req, res) => {
  console.log(orders);
  const order = await orders.find((order) => order.id == req.params.id);
  console.log(order);
  res.status(200).json(order);
});

const start = async () => {
  try {
    await sequelize.sync({
      // alter: true,
    });
    await DeliveryCost.findAll();
    await Destination.findAll();
    await Cart.findAll();
    await CartItem.findAll();
    server.listen(PORT, () => {
      console.log(`server is running on port : ${PORT}`);
    });
  } catch (err) {
    console.log("err", err);
  }
};

start();
