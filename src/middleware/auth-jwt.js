import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const auth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer")) {
    return res.status(401).json({ msg: "Authentication Invalid" });
  }
  const token = authHeader.split(" ")[1];

  try {
    const payload = await jwt.verify(token, process.env.JWT_SECRET_ACCESS);
    req.user = { id: payload.id, role: payload.role };
    next();
  } catch (error) {
    return res.status(401).json({ msg: "Authentication Invalid" });
  }
};

export default auth;
