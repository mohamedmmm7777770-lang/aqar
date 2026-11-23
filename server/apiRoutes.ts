import express from "express";
import bcrypt from "bcryptjs";
import { OAuth2Client } from "google-auth-library";
import { prisma } from "./db.js";
import { authenticateToken, generateToken, AuthRequest } from "./auth.js";

const router = express.Router();
const googleClient = new OAuth2Client(process.env.VITE_GOOGLE_CLIENT_ID);

// --- Auth Routes ---
router.post("/auth/google", async (req, res) => {
  try {
    const { credential } = req.body;
    
    // Verify Google ID Token
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.VITE_GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    if (!payload) return res.status(400).json({ error: "Invalid Google Token" });

    const { sub: googleId, email, name } = payload;
    if (!email || !name) return res.status(400).json({ error: "Missing email or name from Google" });

    // Check if user exists (by email or googleId)
    let user = await prisma.user.findFirst({
      where: { OR: [{ googleId }, { email }] }
    });

    if (user) {
      // Update googleId if it was a normal signup before
      if (!user.googleId) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { googleId }
        });
      }
    } else {
      // Create new user (default role: buyer)
      user = await prisma.user.create({
        data: {
          name,
          email,
          googleId,
          role: "buyer" // default role, they can change it later or we can add a prompt
        }
      });
    }

    const token = generateToken(user.id, user.role);
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    console.error("Google Auth Error:", error);
    res.status(500).json({ error: "حدث خطأ أثناء تسجيل الدخول بحساب جوجل" });
  }
});

router.post("/auth/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "البريد الإلكتروني مسجل مسبقاً" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, role }
    });

    const token = generateToken(user.id, user.role);
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "حدث خطأ أثناء إنشاء الحساب" });
  }
});

router.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ error: "بيانات الدخول غير صحيحة" });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(400).json({ error: "بيانات الدخول غير صحيحة" });
    }

    const token = generateToken(user.id, user.role);
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "حدث خطأ أثناء تسجيل الدخول" });
  }
});

router.get("/auth/me", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user?.userId } });
    if (!user) return res.status(404).json({ error: "المستخدم غير موجود" });
    res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

// --- Property Routes ---
router.get("/properties", async (req, res) => {
  try {
    const properties = await prisma.property.findMany({
      include: { seller: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" }
    });
    res.json(properties);
  } catch (error) {
    res.status(500).json({ error: "حدث خطأ أثناء جلب العقارات" });
  }
});

// Seller: Add Property
router.post("/properties", authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (req.user?.role !== "seller") {
      return res.status(403).json({ error: "غير مصرح لك بإضافة عقارات" });
    }

    const data = req.body;
    const property = await prisma.property.create({
      data: {
        ...data,
        sellerId: req.user.userId
      }
    });
    res.json(property);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "حدث خطأ أثناء إضافة العقار" });
  }
});

// Seller: Get My Properties
router.get("/properties/me", authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (req.user?.role !== "seller") {
      return res.status(403).json({ error: "غير مصرح" });
    }
    const properties = await prisma.property.findMany({
      where: { sellerId: req.user.userId },
      orderBy: { createdAt: "desc" }
    });
    res.json(properties);
  } catch (error) {
    res.status(500).json({ error: "خطأ أثناء جلب العقارات" });
  }
});

// Seller: Delete Property
router.delete("/properties/:id", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const property = await prisma.property.findUnique({ where: { id: Number(req.params.id) } });
    if (!property) return res.status(404).json({ error: "العقار غير موجود" });
    if (property.sellerId !== req.user?.userId) return res.status(403).json({ error: "غير مصرح" });

    await prisma.savedProperty.deleteMany({ where: { propertyId: property.id } });
    await prisma.property.delete({ where: { id: property.id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "خطأ أثناء الحذف" });
  }
});

// --- Saved Properties (Buyers) ---
router.get("/saved-properties", authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (req.user?.role !== "buyer") return res.status(403).json({ error: "غير مصرح" });
    
    const saved = await prisma.savedProperty.findMany({
      where: { userId: req.user.userId },
      include: { property: true },
      orderBy: { createdAt: "desc" }
    });
    res.json(saved.map(s => s.property));
  } catch (error) {
    res.status(500).json({ error: "خطأ أثناء الجلب" });
  }
});

router.post("/saved-properties/:id", authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (req.user?.role !== "buyer") return res.status(403).json({ error: "غير مصرح" });
    const propertyId = Number(req.params.id);
    
    const existing = await prisma.savedProperty.findUnique({
      where: { userId_propertyId: { userId: req.user.userId, propertyId } }
    });

    if (existing) {
      await prisma.savedProperty.delete({ where: { id: existing.id } });
      res.json({ saved: false });
    } else {
      await prisma.savedProperty.create({
        data: { userId: req.user.userId, propertyId }
      });
      res.json({ saved: true });
    }
  } catch (error) {
    res.status(500).json({ error: "حدث خطأ" });
  }
});

export default router;
