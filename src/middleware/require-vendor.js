import Vendor from "../models/Vendor.js";

const requireVendor = async (req, res, next) => {
  const isVendor = await Vendor.findOne({ where: { id: req.user.id } });
  if (!isVendor) {
    return res.status(401).json({ msg: "คุณไม่ใช่บัญชีร้านค้า" });
  }
  next();
};

export default requireVendor;
