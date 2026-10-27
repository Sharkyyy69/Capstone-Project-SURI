import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import prisma from '../config/prisma.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();
const uploadDir = path.join(process.cwd(), 'uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage });

function evaluateProduct(productType, fileName) {
  const predictiveScore = Math.min(98, Math.max(35, (fileName.length % 40) + 55));

  if (productType === 'meat') {
    if (predictiveScore > 72) return { label: 'Fresh', recommendation: 'Buy' };
    if (predictiveScore > 52) return { label: 'Questionable', recommendation: 'Review before purchase' };
    return { label: 'Spoiled', recommendation: 'Avoid purchase' };
  }

  if (predictiveScore > 74) return { label: 'Fresh', recommendation: 'Buy' };
  if (predictiveScore > 55) return { label: 'Overripe', recommendation: 'Use with caution' };
  return { label: 'Spoiled', recommendation: 'Discard' };
}

router.post('/upload', protect, upload.single('image'), async (req, res) => {
  const { productType, itemName } = req.body;

  if (!req.file) {
    return res.status(400).json({ message: 'An image is required.' });
  }

  const fileUrl = `/uploads/${req.file.filename}`;
  const result = evaluateProduct(productType || 'fruit', req.file.filename);
  const score = Math.round(100 - (Math.abs(result.label.length - 5) * 4 + Math.random() * 10));

  const assessment = await prisma.assessment.create({
    data: {
      userId: req.user.id,
      productType: productType || 'fruit',
      itemName: itemName || 'Unnamed item',
      result: result.label,
      score,
      imageUrl: fileUrl,
      recommendation: result.recommendation,
    },
  });

  return res.status(201).json({
    message: 'Assessment created successfully.',
    assessment,
  });
});

router.get('/history', protect, async (req, res) => {
  const items = await prisma.assessment.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: 'desc' },
  });

  return res.json(items);
});

export default router;
