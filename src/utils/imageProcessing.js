import sharp from "sharp";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

// กำหนด path โฟลเดอร์
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const resizeAndCompressImage = async (file) => {
  // ตั้งชื่อไฟล์ใหม่
  const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
  const fileExtension = path.extname(file.originalname);
  const processedFilename = `menu-${uniqueSuffix}${fileExtension}`;
  const outputPath = path.join(
    __dirname,
    "../uploads/menus",
    processedFilename
  );

  // ใช้ sharp สำหรับปรับขนาดและบีบอัด
  await sharp(file.buffer) // ใช้ buffer แทน file.path
    .resize(300, 300) // ปรับขนาดเป็นสี่เหลี่ยมจัตุรัส
    .toFormat("png") // เปลี่ยนเป็น PNG
    .toFile(outputPath); // เซฟไฟล์

  return processedFilename; // ส่งคืนชื่อไฟล์ที่ผ่านการบีบอัดแล้ว
};

export const resizeAndCompressVendorImage = async (file) => {
  // ตั้งชื่อไฟล์ใหม่
  const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
  const fileExtension = path.extname(file.originalname);
  const processedFilename = `vendor-${uniqueSuffix}${fileExtension}`;
  const outputPath = path.join(
    __dirname,
    "../uploads/vendors",
    processedFilename
  );

  // ใช้ sharp สำหรับปรับขนาดและบีบอัด
  await sharp(file.buffer) // ใช้ buffer แทน file.path
    .resize(300, 300) // ปรับขนาดเป็นสี่เหลี่ยมจัตุรัส
    .toFormat("png") // เปลี่ยนเป็น PNG
    .toFile(outputPath); // เซฟไฟล์

  return processedFilename; // ส่งคืนชื่อไฟล์ที่ผ่านการบีบอัดแล้ว
};

export const resizeAndCompressSlipImage = async (file) => {
  // ตั้งชื่อไฟล์ใหม่
  const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
  const fileExtension = path.extname(file.originalname);
  const processedFilename = `slip-${uniqueSuffix}${fileExtension}`;
  const outputPath = path.join(
    __dirname,
    "../uploads/slips",
    processedFilename
  );

  // ใช้ sharp สำหรับปรับขนาดและบีบอัด
  await sharp(file.buffer) // ใช้ buffer แทน file.path
    .resize(600, 800) // ปรับขนาดเป็นสี่เหลี่ยมจัตุรัส
    .toFormat("png") // เปลี่ยนเป็น PNG
    .toFile(outputPath); // เซฟไฟล์

  return processedFilename; // ส่งคืนชื่อไฟล์ที่ผ่านการบีบอัดแล้ว
};

export const resizeAndCompressDeliveryImage = async (file) => {
  // ตั้งชื่อไฟล์ใหม่
  const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
  const fileExtension = path.extname(file.originalname);
  const processedFilename = `delivery-${uniqueSuffix}${fileExtension}`;
  const outputPath = path.join(
    __dirname,
    "../uploads/delivery",
    processedFilename
  );

  // ใช้ sharp สำหรับปรับขนาดและบีบอัด
  await sharp(file.buffer) // ใช้ buffer แทน file.path
    .resize(600, 800) // ปรับขนาดเป็นสี่เหลี่ยมจัตุรัส
    .toFormat("png") // เปลี่ยนเป็น PNG
    .toFile(outputPath); // เซฟไฟล์

  return processedFilename; // ส่งคืนชื่อไฟล์ที่ผ่านการบีบอัดแล้ว
};

export const resizeAndCompressPromotionsImage = async (file) => {
  // ตั้งชื่อไฟล์ใหม่
  const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
  const fileExtension = path.extname(file.originalname);
  const processedFilename = `promotion-${uniqueSuffix}${fileExtension}`;
  const outputPath = path.join(
    __dirname,
    "../uploads/promotions",
    processedFilename
  );

  // ใช้ sharp สำหรับปรับขนาดและบีบอัด
  await sharp(file.buffer) // ใช้ buffer แทน file.path
    .toFormat("png") // เปลี่ยนเป็น PNG
    .toFile(outputPath); // เซฟไฟล์

  return processedFilename; // ส่งคืนชื่อไฟล์ที่ผ่านการบีบอัดแล้ว
};
