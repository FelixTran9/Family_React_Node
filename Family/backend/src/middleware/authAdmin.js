import jwt from "jsonwebtoken";

/**
 * Middleware bảo vệ các route admin.
 * Kiểm tra JWT token trong header Authorization: Bearer <token>
 */
const authAdmin = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Chưa đăng nhập hoặc token không hợp lệ" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.adminUser = decoded; // { id, name, role: 'truong' | 'troly' }
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token hết hạn hoặc không hợp lệ" });
  }
};

export default authAdmin;
