import DeliveryCost from "../models/DeliveryCost.js";

const getDeliveryCost = async (req, res) => {
  const cost = await DeliveryCost.findOne({ attributes: ["shipping_fee"] });
  return res.status(200).json(cost.shipping_fee);
};

const updateShippingFee = async (req, res) => {
  const { shipping_fee } = req.body;

  if (!shipping_fee) {
    return res.status(400).json({ msg: "กรุณากรอกค่าส่งของคุณ" });
  }
  await DeliveryCost.destroy({ where: {} });
  const cost = await DeliveryCost.create({ shipping_fee });
  return res.status(200).json(cost.shipping_fee);
};

export { getDeliveryCost, updateShippingFee };
