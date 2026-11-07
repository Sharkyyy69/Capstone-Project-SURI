import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import prisma from '../config/prisma.js';

const router = express.Router();
const pendingRegistrations = new Map();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT || 587),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

function createToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET || 'development-secret',
    { expiresIn: '7d' },
  );
}

function generateVerificationCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

async function sendVerificationEmail(email, code) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return { sent: false, code };
  }

  try {
    await transporter.sendMail({
      from: `"SURI" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: email,
      subject: 'Your SURI verification code',
      text: `Your SURI verification code is ${code}. This code expires in 10 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #1f2937;">
          <h2 style="color: #166534;">SURI verification</h2>
          <p>Your verification code is:</p>
          <p style="font-size: 30px; font-weight: bold; letter-spacing: 4px; color: #166534;">${code}</p>
          <p>This code expires in 10 minutes.</p>
        </div>
      `,
    });

    return { sent: true, code };
  } catch (error) {
    console.error('Verification email failed:', error.message);
    return { sent: false, code };
  }
}

router.post('/register', async (req, res) => {
  const name = String(req.body.name || '').trim();
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required.' });
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) {
    return res.status(409).json({ message: 'A user with this email already exists.' });
  }

  const verificationCode = generateVerificationCode();
  const passwordHash = await bcrypt.hash(password, 10);
  const expiresAt = Date.now() + 10 * 60 * 1000;

  pendingRegistrations.set(email, {
    name,
    email,
    passwordHash,
    code: verificationCode,
    expiresAt,
  });

  const result = await sendVerificationEmail(email, verificationCode);

  return res.status(200).json({
    message: 'Verification code sent to your email address.',
    email,
    code: result.sent ? undefined : verificationCode,
  });
});

router.post('/verify-registration', async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const code = String(req.body.code || '').trim();

  if (!email || !code) {
    return res.status(400).json({ message: 'Email and verification code are required.' });
  }

  const pending = pendingRegistrations.get(email);

  if (!pending) {
    return res.status(400).json({ message: 'No pending registration was found for this email.' });
  }

  if (Date.now() > pending.expiresAt) {
    pendingRegistrations.delete(email);
    return res.status(400).json({ message: 'The verification code has expired. Please register again.' });
  }

  if (pending.code !== code) {
    return res.status(400).json({ message: 'The verification code is invalid.' });
  }

  const user = await prisma.user.create({
    data: {
      name: pending.name,
      email: pending.email,
      password: pending.passwordHash,
    },
  });

  pendingRegistrations.delete(email);

  const token = createToken(user);

  return res.status(201).json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
  });
});

router.post('/login', async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }

  const token = createToken(user);

  return res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
  });
});

export default router;
