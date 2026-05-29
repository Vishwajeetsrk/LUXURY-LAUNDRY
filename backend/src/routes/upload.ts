import { Router, Response, Request } from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { authenticate, requireRoles } from "../middleware/auth";
import fs from "fs";

const router = Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Multer for local temporary storage
const upload = multer({ dest: "uploads/" });

// POST /api/upload
router.post("/", authenticate, requireRoles(["SUPER_ADMIN"]), upload.single("image"), async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ message: "No image file provided" });
      return;
    }

    // Check if Cloudinary is configured
    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      console.warn("Cloudinary not configured. Returning local URL.");
      // Fallback to local URL if Cloudinary is not set up
      res.json({ url: `/uploads/${req.file.filename}` });
      return;
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "luxwash",
    });

    // Delete local temp file
    fs.unlinkSync(req.file.path);

    res.json({ url: result.secure_url });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ message: "Image upload failed" });
  }
});

export default router;
