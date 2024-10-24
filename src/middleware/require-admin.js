import Admin from "../models/Admin.js";

const requireAdmin = async (req, res, next) => {
    const isAdmin = await Admin.findOne({ where: { id: req.user.id } });
    if (!isAdmin) {
      return res.status(401).json({ msg: "คุณไม่ใช่ผู้ดูแลระบบ" });
    }
  next();
};

export default requireAdmin;
