import { Router, Response, Request } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma";
import { getJwtSecret } from "../lib/jwt";
import { authenticate, AuthRequest } from "../middleware/auth";
import { z } from "zod";
import { validate } from "../middleware/validate";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().optional()
});

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required")
});

const router = Router();

// POST /api/auth/register
router.post("/register", validate(registerSchema), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, email, password, phone } = req.body;
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      res.status(400).json({ message: "Email already registered" });
      return;
    }
    const hashed = await bcrypt.hash(password, 10);
    
    // Check for welcome bonus
    const welcomeBonusSetting = await prisma.siteSettings.findUnique({
      where: { key: "welcome_bonus_credits" }
    });
    const welcomeBonus = welcomeBonusSetting && !isNaN(Number(welcomeBonusSetting.value)) ? Number(welcomeBonusSetting.value) : 0;

    let user;
    if (welcomeBonus > 0) {
      user = await prisma.$transaction(async (tx) => {
        const newUser = await tx.user.create({
          data: { name, email, password: hashed, phone: phone || null, role: "CUSTOMER", walletBalance: welcomeBonus },
        });
        await tx.walletTransaction.create({
          data: {
            userId: newUser.id,
            amount: welcomeBonus,
            type: "CREDIT",
            description: "Welcome Bonus"
          }
        });
        return newUser;
      });
    } else {
      user = await prisma.user.create({
        data: { name, email, password: hashed, phone: phone || null, role: "CUSTOMER" },
      });
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, getJwtSecret(), { expiresIn: "7d" });
    
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    
    res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone } });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/auth/login
router.post("/login", validate(loginSchema), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, getJwtSecret(), { expiresIn: "7d" });
    
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone } });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/auth/logout
router.get("/logout", (req: Request, res: Response) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
  res.json({ message: "Logged out successfully" });
});

// POST /api/auth/logout (alias for convenience)
router.post("/logout", (req: Request, res: Response) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
  res.json({ message: "Logged out successfully" });
});

// GET /api/auth/me
router.get("/me", authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { id: true, name: true, email: true, role: true, phone: true, addresses: true, createdAt: true },
    });
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.json(user);
  } catch (err) {
    console.error("Me error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// PATCH /api/auth/me
const updateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  phone: z.string().optional(),
  addresses: z.array(z.string()).optional(),
});

router.patch("/me", authenticate, validate(updateProfileSchema), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, phone, addresses } = req.body;
    const data: any = {};
    if (name) data.name = name;
    if (phone !== undefined) data.phone = phone;
    if (addresses !== undefined) {
      data.addresses = addresses.filter((a: string) => a.trim() !== "");
    }
    
    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data,
      select: { id: true, name: true, email: true, role: true, phone: true, addresses: true, createdAt: true },
    });
    
    res.json(user);
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
