import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import prisma from '../config/prisma.js';

const router = express.Router();
const pendingRegistrations = new Map();
const pendingPasswordResets = new Map();

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

function getAuthEmailLayout({ title, intro, detail, code, footer }) {
  const plainText = [
    title,
    '',
    intro,
    '',
    `Code: ${code}`,
    '',
    detail,
    '',
    footer,
  ].join('\n');

  return {
    text: plainText,
    html: `
      <div style="margin: 0; padding: 0; background-color: #edf3ee; font-family: Arial, sans-serif; color: #1f2937;">
        <div style="max-width: 600px; margin: 32px auto; background: #ffffff; border: 1px solid #dfe7df; border-radius: 18px; overflow: hidden; box-shadow: 0 12px 30px rgba(23, 42, 32, 0.08);">
          <div style="background: linear-gradient(135deg, #1d8b5f, #2ca76b); padding: 26px 32px; color: #ffffff;">
            <div style="font-size: 12px; letter-spacing: 2px; text-transform: uppercase; opacity: 0.9;">FreshLens</div>
            <h1 style="margin: 12px 0 0; font-size: 30px; line-height: 1.2;">${title}</h1>
          </div>
          <div style="padding: 32px;">
            <p style="margin: 0 0 18px; font-size: 16px; line-height: 1.6; color: #374151;">${intro}</p>
            <div style="background: #f1f8f3; border: 1px solid #d6e8d9; border-radius: 12px; padding: 20px; text-align: center; margin: 26px 0;">
              <div style="font-size: 12px; letter-spacing: 1.5px; text-transform: uppercase; color: #2d6a4d; font-weight: bold; margin-bottom: 10px;">Your code</div>
              <div style="font-size: 34px; letter-spacing: 8px; color: #166534; font-weight: bold;">${code}</div>
            </div>
            <p style="margin: 0 0 12px; font-size: 15px; line-height: 1.7; color: #4b5563;">${detail}</p>
            <p style="margin: 0; font-size: 14px; line-height: 1.7; color: #6b7280;">${footer}</p>
          </div>
        </div>
      </div>
    `,
  };
}

async function sendVerificationEmail(email, code) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return { sent: false, code };
  }

  const message = getAuthEmailLayout({
    title: 'Verify your email',
    intro: 'Thanks for joining FreshLens. To complete your registration, please use the verification code below.',
    detail: 'This code expires in 10 minutes. If you did not create an account, you can safely ignore this email.',
    code,
    footer: 'FreshLens Security Team',
  });

  try {
    await transporter.sendMail({
      from: `"FreshLens" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: email,
      subject: 'Verify your FreshLens account',
      text: message.text,
      html: message.html,
    });

    return { sent: true, code };
  } catch (error) {
    console.error('Verification email failed:', error.message);
    return { sent: false, code };
  }
}

async function sendPasswordResetEmail(email, code) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return { sent: false, code };
  }

  const message = getAuthEmailLayout({
    title: 'Reset your password',
    intro: 'We received a request to reset the password for your FreshLens account.',
    detail: 'Use the code below to continue with your password reset. This code expires in 10 minutes and can only be used once.',
    code,
    footer: 'If you did not request this reset, please contact support immediately.',
  });

  try {
    await transporter.sendMail({
      from: `"FreshLens" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: email,
      subject: 'Reset your FreshLens password',
      text: message.text,
      html: message.html,
    });

    return { sent: true, code };
  } catch (error) {
    console.error('Password reset email failed:', error.message);
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
  const shouldExposeCode = process.env.NODE_ENV !== 'production' || !result.sent;

  return res.status(200).json({
    message: 'Verification code sent to your email address.',
    email,
    code: shouldExposeCode ? verificationCode : undefined,
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

router.post('/forgot-password', async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();

  if (!email) {
    return res.status(400).json({ message: 'Email is required.' });
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return res.status(404).json({ message: 'No account was found for that email address.' });
  }

  const resetCode = generateVerificationCode();
  const expiresAt = Date.now() + 10 * 60 * 1000;

  pendingPasswordResets.set(email, {
    code: resetCode,
    expiresAt,
  });

  const result = await sendPasswordResetEmail(email, resetCode);
  const shouldExposeCode = process.env.NODE_ENV !== 'production' || !result.sent;

  return res.status(200).json({
    message: 'A password reset code has been sent to your email address.',
    email,
    code: shouldExposeCode ? resetCode : undefined,
  });
});

router.post('/reset-password', async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const code = String(req.body.code || '').trim();
  const password = String(req.body.password || '');

  if (!email || !code || !password) {
    return res.status(400).json({ message: 'Email, reset code, and new password are required.' });
  }

  if (password.length < 8) {
    return res.status(400).json({ message: 'New password must be at least 8 characters long.' });
  }

  const pendingReset = pendingPasswordResets.get(email);

  if (!pendingReset) {
    return res.status(400).json({ message: 'No password reset request was found for this email.' });
  }

  if (Date.now() > pendingReset.expiresAt) {
    pendingPasswordResets.delete(email);
    return res.status(400).json({ message: 'The password reset code has expired. Please request a new one.' });
  }

  if (pendingReset.code !== code) {
    return res.status(400).json({ message: 'The password reset code is invalid.' });
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return res.status(404).json({ message: 'No account was found for that email address.' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.update({
    where: { email },
    data: { password: passwordHash },
  });

  pendingPasswordResets.delete(email);

  return res.status(200).json({
    message: 'Your password has been updated successfully.',
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
