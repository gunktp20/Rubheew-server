import Category from "../models/Category.js";
import Menu from "../models/Menu.js";

const getCategories = async (req, res) => {
  const categories = await Category.findAll({});
  res.status(200).json(categories);
};

const insertCategory = async (req, res) => {
  const { category_id, category_name } = req.body;
  if (!category_id) {
    return res.status(400).json({ msg: "กรุณากรอกตัวย่อประเภทของคุณ" });
  }
  if (!category_name) {
    return res.status(400).json({ msg: "กรุณากรอกชื่อประเภทของคุณ" });
  }

  const category = await Category.findOne({ where: { category_name } });
  if (category) {
    return res.status(400).json({ msg: "ประเภทที่คุณเพิ่มมีอยู่แล้วในระบบ" });
  }

  await Category.create({ id: category_id, category_name });
  res.status(200).json({ msg: "เพิ่มประเภทอาหารของคุณสำเร็จ" });
};

const deleteCategory = async (req, res) => {
  const { category_id } = req.params;

  const category = await Category.findOne({ where: { id: category_id } });

  if (!category) {
    return res.status(400).json({ msg: "ไม่พบประเภทอาหารของคุณ" });
  }

  const categoryInUse = await Menu.findOne({ where: { category_id } });
  if (categoryInUse) {
    return res.status(400).json({ msg: "ประเภทที่คุณกำลังจะลบถูกใช้งานอยู่" });
  }

  category.destroy();
  await category.save();

  res.status(200).json({ msg: "ลบประเภทอาหารของคุณสำเร็จ" });
};

export { getCategories, insertCategory, deleteCategory };
