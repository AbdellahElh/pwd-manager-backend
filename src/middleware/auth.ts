// src/middleware/auth.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
  const token = req.header("Authorization")?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Access token missing" });
  }

  try {
    const secret = process.env.JWT_SECRET as string;
    const payload = jwt.verify(token, secret);
    // You could attach payload info to req.user here if needed
    next();
  } catch (error) {
    res.status(403).json({ message: "Invalid token" });
  }
};
