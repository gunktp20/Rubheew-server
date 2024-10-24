import Destination from "../models/Destination.js";
import Order from "../models/Order.js";

const getDestinations = async (req, res) => {
  const destinations = await Destination.findAll({});
  res.status(200).json(destinations);
};

const insertDestination = async (req, res) => {
  const { destination_name, lat, lng } = req.body;

  if (!destination_name || !lat || !lng) {
    return res.status(400).json({ msg: "กรุณากรอกข้อมูลให้ครบถ้วน" });
  }

  const destination = await Destination.findOne({
    where: { destination_name },
  });

  if (destination) {
    return res.status(400).json({ msg: "ประเภทที่คุณเพิ่มมีอยู่แล้วในระบบ" });
  }

  await Destination.create({ destination_name, lat, lng });

  res.status(200).json({ msg: "เพิ่มตำแหน่งที่ตั้งสำเร็จ" });
};

const deleteDestination = async (req, res) => {
  const { destination_id } = req.params;

  const destination = await Destination.findOne({
    where: { id: destination_id },
  });

  if (!destination) {
    return res.status(400).json({ msg: "ไม่พบที่ตั้งของคุณ" });
  }

  const orderInUse = await Order.findOne({ where: { destination_id } });
  if (orderInUse) {
    return res.status(400).json({ msg: "ปลายทางที่คุณกำลังจะลบถูกใช้งานอยู่" });
  }

  destination.destroy();
  await destination.save();

  res.status(200).json({ msg: "ลบปลายทางของคุณสำเร็จ" });
};

export { getDestinations, insertDestination, deleteDestination };
