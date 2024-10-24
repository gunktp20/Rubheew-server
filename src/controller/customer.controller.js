import Customer from "../models/Customer.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { FORM_VERIFY_EMAIL } from "../utils/emailVerification.js";
import transporter from "../utils/transporter.js";
import bcrypt from "bcrypt";
import schedule from "node-schedule";
import { Op } from "sequelize";
dotenv.config();

const register = async (req, res) => {
  const { username, email, password, fname, lname, phone_number } = req.body;
  if (!username || !email || !password || !fname || !lname || !phone_number) {
    return res.status(400).json({ msg: "กรุณากรอกข้อมูลให้ครบถ้วน" });
  }

  const existingUser = await Customer.findOne({
    where: {
      [Op.or]: [{ username: username }, { email: email }],
    },
  });

  const salt = await bcrypt.genSalt(10);
  const encodedPassword = await bcrypt.hash(password, salt);

  const date = new Date();
  const expiredIn = date.setMinutes(date.getMinutes() + 4);

  const token = await jwt.sign({ email }, process.env.SECRET_VERIFY_EMAIL, {
    expiresIn: "4m",
  });

  if (existingUser && !existingUser.verified) {
    await Customer.destroy({ where: { id: existingUser.id } });

    await transporter.sendMail({
      from: process.env.AUTH_EMAIL,
      to: email,
      html: FORM_VERIFY_EMAIL(token, process.env.CLIENT_URL),
    });

    const countDeleteUser = schedule.scheduleJob(expiredIn, async () => {
      const user = await Customer.findOne({ where: { email } });
      if (user?.verified === false) {
        await Customer.destroy({ where: { email } });
      }
      countDeleteUser.cancel();
    });

    await Customer.create({
      username: username,
      email: email,
      fname,
      lname,
      password: encodedPassword,
      phone_number,
    });
    return res
      .status(200)
      .json({ msg: "สมัครสมาชิกเสร็จสิ้น กรุณายืนยันอีเมลล์ของคุณ" });
  } else if (existingUser && existingUser.verified) {
    return res.status(400).json({
      message: "ชื่อผู้ใช้หรืออีเมลได้ลงทะเบียนและยืนยันแล้ว",
    });
  } else if (!existingUser) {
    await transporter.sendMail({
      from: process.env.AUTH_EMAIL,
      to: email,
      html: FORM_VERIFY_EMAIL(token, process.env.CLIENT_URL),
    });

    const countDeleteUser = schedule.scheduleJob(expiredIn, async () => {
      const user = await Customer.findOne({ where: { email } });
      if (user?.verified === false) {
        await Customer.destroy({ where: { email } });
      }
      countDeleteUser.cancel();
    });

    await Customer.create({
      username: username,
      email: email,
      fname,
      lname,
      password: encodedPassword,
    });
    return res
      .status(200)
      .json({ msg: "สมัครสมาชิกเสร็จสิ้น กรุณายืนยันอีเมลล์ของคุณ" });
  }
};

const comparePassword = async (password, storedHashedPassword) => {
  const isMatch = await bcrypt.compare(password, storedHashedPassword);
  return isMatch;
};

const login = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ msg: "กรุณากรอกข้อมูลให้ครบถ้วน" });
  }

  const user = await Customer.findOne({ where: { username } });

  if (!user) {
    return res.status(401).json({ msg: "ชื่อผู้ใช้ หรือ รหัสผ่าน ไม่ถูกต้อง" });
  }

  const isPasswordValid = await comparePassword(password, user.password);

  if (!isPasswordValid) {
    return res.status(401).json({ msg: "ชื่อผู้ใช้ หรือ รหัสผ่าน ไม่ถูกต้อง" });
  }

  if (user.verified == false) {
    return res
      .status(401)
      .json({ msg: "คุณยังไม่ได้สามารถเข้าสู่ระบบได้ กรุณายืนยันตัวตนก่อน" });
  }
  const token = await jwt.sign(
    {
      id: user.id,
      username: user.username,
      email: user.email,
      role: "customer",
    },
    process.env.JWT_SECRET_ACCESS,
    {
      expiresIn: "1d",
    }
  );

  res.status(200).json({ user, token, customer: user });
};

const verifyEmailWithToken = async (req, res) => {
  const token = req.params.token;
  if (!token) {
    return res.status(400).json({ msg: "กรุณากรอกข้อมูลให้ครบถ้วน" });
  }
  try {
    const { email } = await jwt.verify(token, process.env.SECRET_VERIFY_EMAIL);

    const user = await Customer.findOne({ where: { email } });
    if (user?.verified === true) {
      return res.status(400).json({ msg: "บัญชีนี้ถูกยืนยันตัวตนแล้ว" });
    }

    await Customer.update(
      { verified: true },
      {
        where: { email },
      }
    );

    return res.status(200).json({
      msg: `บัญชีของคุณยืนยันตัวตนสำเร็จ`,
    });
  } catch (err) {
    return res.status(403).json({ msg: "Token ของคุณไม่ถูกต้อง" });
  }
};

export { register, login, verifyEmailWithToken };
