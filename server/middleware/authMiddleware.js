import jwt from "jsonwebtoken";
import User from "../models/User.js";

export async function protect(req, res, next) {
  const authHeader = req.headers.authorization;
  console.log("Authorization Header:", authHeader); // Debugging: Log the Authorization header

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "Not authorized, token missing or malformed" });
  }

  const token = authHeader.split(" ")[1];
  console.log("Extracted Token:", token); // Debugging: Log the token

  if (!token) {
    return res.status(401).json({ message: "Token is missing" });
  }

  try {
    // Verify and decode token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded Token:", decoded); // Debugging: Log decoded token

    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      return res.status(404).json({ message: "User not found" });
    }

    next();
  } catch (err) {
    console.error("Error verifying token:", err.message, {
      token,
      errorDetails: err,
    });

    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token has expired" });
    }
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Malformed token" });
    }

    res.status(401).json({ message: "Token verification failed" });
  }
}
