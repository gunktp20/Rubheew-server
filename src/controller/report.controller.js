import Report from "../models/Report.js";
import Customer from "../models/Customer.js";

const createReport = async (req, res) => {
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({ msg: "กรุณากรอกข้อมูลให้ครบถ้วน" });
  }

  await Report.create({ content, customer_id: req.user.id });
  res.status(200).json({ msg: "ส่งรายงานของคุณแก่ผู้ดูแลเรียบร้อย" });
};

const getAllReports = async (req, res) => {
  const reports = await Report.findAll({
    include: [
      {
        model: Customer,
        attributes: ["id", "username", "fname", "lname"],
      },
    ],
  });

  return res.status(200).json(reports);
};

export { createReport, getAllReports };
