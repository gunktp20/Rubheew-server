import Customer from "../models/Customer.js";

const requireCustomer = async (req, res, next) => {
  const isCustomer = await Customer.findOne({ where: { id: req.user.id } });
  if (!isCustomer) {
    return res.status(401).json({ msg: "คุณไม่ใช่ผู้ใช้ทั่วไป" });
  }
  next();
};

export default requireCustomer;
