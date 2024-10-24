import { resizeAndCompressPromotionsImage } from "../utils/imageProcessing.js";
import Promotion from "../models/Promotions.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

// แปลง URL ของไฟล์ให้เป็น path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const insertPromotion = async (req, res) => {
  if (!req.file) {
    console.log("No file uploaded");
    return res.status(400).json({ msg: "กรุณาอัพโหลดรูปภาพเมนูอาหารของคุณ" });
  }

  const processedFilename = await resizeAndCompressPromotionsImage(req.file);

  await Promotion.create({ image: processedFilename });

  return res.status(200).json({ msg: "เพิ่มโปรโมชั่นเสร็จสิ้น" });
};

const deletePromotion = async (req, res) => {
  const { promotion_id } = req.params;

  const promotion = await Promotion.findOne({ where: { id: promotion_id } });

  if (!promotion) {
    return res.status(400).json({ msg: "ไม่พบโปรโมชั่นของคุณ" });
  }
  console.log(promotion);

  const filePath = path.join(
    __dirname,
    "../uploads",
    "promotions",
    promotion.image
  );

  console.log('filePath',filePath)

  fs.unlink(filePath, (err) => {
    if (err) {
      console.error("Error occurred while deleting the file:", err);
      return;
    }
    console.log("File deleted successfully");
  });

  promotion.destroy();
  await promotion.save();

  return res.status(200).json({ msg: "ลบโปรโมชั่นเสร็จสิ้น" });
};

const getAllPromotions = async (req, res) => {
  const promotions = await Promotion.findAll({ where: {} });
  res.status(200).json(promotions);
};

export { insertPromotion, getAllPromotions, deletePromotion };
