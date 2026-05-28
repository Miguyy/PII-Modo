/* import jwt from "jsonwebtoken";
import { User } from "../config/db.config.js";

export const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ msg: "No token provided!" });

    const [scheme, token] = authHeader.split(" ");
    if (scheme !== "Bearer" || !token)
      return res
        .status(401)
        .json({ msg: "Invalid Authorization format. Use: Bearer <token>" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // fetch user instance from DB and attach to request
    const user = await User.findByPk(decoded.id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    req.user = user; // controllers use `await req.user`, awaiting an object is fine
    req.userId = decoded.id;
    req.userRole = decoded.tipo_utilizador || user.tipo_utilizador;

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError")
      return res.status(401).json({ msg: "Token has expired" });
    else if (error.name === "JsonWebTokenError")
      return res.status(401).json({ msg: "Invalid token" });
    else return res.status(401).json({ msg: "Error verifying token" });
  }
};

// middleware to check if the user has admin role (uses `tipo_utilizador`)
export const requireAdmin = (req, res, next) => {
  const role = req.userRole || (req.user && req.user.tipo_utilizador);
  if (role !== "admin") {
    return res.status(403).json({ msg: "Admin role required" });
  }
  next();
};

// middleware to check if the user has certain role
export const requireRole = (role) => {
  return (req, res, next) => {
    const current = req.userRole || (req.user && req.user.tipo_utilizador);
    if (current !== role) {
      return res.status(403).json({ msg: `${role} role required` });
    }
    next();
  };
};
 */
