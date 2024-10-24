import Rider from "../models/Rider.js";

const requireRider = async (req, res, next) => {
  const isRider = await Rider.findOne({ where: { id: req.user.id } });
  if (!isRider) {
    return res.status(401).json({ msg: "คุณไม่ใช่บัญชีผู้ขับ" });
  }
  next();
};

export default requireRider;
