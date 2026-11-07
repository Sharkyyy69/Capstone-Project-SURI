import crypto from 'node:crypto';
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import prisma from '../config/prisma.js';

const router = express.Router();
const pendingRegistrations = new Map();
const pendingPasswordResets = new Map();

const CODE_TTL_MS = 10 * 60 * 1000;
const MAX_RESET_ATTEMPTS = 5;
const MIN_PASSWORD_LENGTH = 8;

// Created on first use rather than at import time: this module is imported
// before dotenv.config() runs in app.js, so SMTP_* are not set yet at import.
let transporter;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT || 587),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  return transporter;
}

function createToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET || 'development-secret',
    { expiresIn: '7d' },
  );
}

function generateVerificationCode() {
  return String(crypto.randomInt(100000, 1000000));
}

const emailTemplates = {
  verification: {
    subject: 'Your SURI verification code',
    heading: 'SURI verification',
    intro: 'Your verification code is:',
  },
  'password-reset': {
    subject: 'Your SURI password reset code',
    heading: 'Reset your SURI password',
    intro: 'Use this code to reset your password:',
    outro: "If you didn't ask to reset your password, you can ignore this email.",
  },
};

function isEmailConfigured() {
  return Boolean(process.env.SMTP_USER && process.env.SMTP_PASS);
}

async function sendCodeEmail(email, code, purpose = 'verification') {
  if (!isEmailConfigured()) {
    return { sent: false, code };
  }

  const template = emailTemplates[purpose];

  try {
    await getTransporter().sendMail({
      from: `"SURI" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: email,
      subject: template.subject,
      text: `${template.intro} ${code}. This code expires in 10 minutes.${template.outro ? ` ${template.outro}` : ''}`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #1f2937;">
          <h2 style="color: #166534;">${template.heading}</h2>
          <p>${template.intro}</p>
          <p style="font-size: 30px; font-weight: bold; letter-spacing: 4px; color: #166534;">${code}</p>
          <p>This code expires in 10 minutes.</p>
          ${template.outro ? `<p style="color: #6b7280;">${template.outro}</p>` : ''}
        </div>
      `,
    });

    return { sent: true, code };
  } catch (error) {
    console.error(`Email (${purpose}) failed:`, error.message);
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

  if (password.length < MIN_PASSWORD_LENGTH) {
    return res.status(400).json({
      message: `Your password must be at least ${MIN_PASSWORD_LENGTH} characters long.`,
    });
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) {
    return res.status(409).json({ message: 'A user with this email already exists.' });
  }

  const verificationCode = generateVerificationCode();
  const passwordHash = await bcrypt.hash(password, 10);
  const expiresAt = Date.now() + CODE_TTL_MS;

  pendingRegistrations.set(email, {
    name,
    email,
    passwordHash,
    code: verificationCode,
    expiresAt,
  });

  const result = await sendCodeEmail(email, verificationCode, 'verification');

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

const RESET_REQUEST_MESSAGE = 'If an account exists for that email, a password reset code has been sent.';

router.post('/forgot-password', async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();

  if (!email) {
    return res.status(400).json({ message: 'Email is required.' });
  }

  const user = await prisma.user.findUnique({ where: { email } });

  // Same response whether or not the account exists, so the endpoint
  // can't be used to find out which emails are registered.
  if (!user) {
    return res.json({ message: RESET_REQUEST_MESSAGE, email });
  }

  const code = generateVerificationCode();

  pendingPasswordResets.set(email, {
    codeHash: await bcrypt.hash(code, 10),
    expiresAt: Date.now() + CODE_TTL_MS,
    attempts: 0,
  });

  const result = await sendCodeEmail(email, code, 'password-reset');

  // Without SMTP configured, hand the code back so the flow can be tested
  // locally. Never do this in production: anyone could reset any account.
  const exposeCode = !result.sent && process.env.NODE_ENV !== 'production';

  return res.json({
    message: RESET_REQUEST_MESSAGE,
    email,
    code: exposeCode ? code : undefined,
  });
});

router.post('/reset-password', async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const code = String(req.body.code || '').trim();
  const password = String(req.body.password || '');

  if (!email || !code || !password) {
    return res.status(400).json({ message: 'Email, reset code, and new password are required.' });
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    return res.status(400).json({
      message: `Your new password must be at least ${MIN_PASSWORD_LENGTH} characters long.`,
    });
  }

  const pending = pendingPasswordResets.get(email);
  const invalidMessage = 'The reset code is invalid or has expired. Please request a new one.';

  if (!pending) {
    return res.status(400).json({ message: invalidMessage });
  }

  if (Date.now() > pending.expiresAt || pending.attempts >= MAX_RESET_ATTEMPTS) {
    pendingPasswordResets.delete(email);
    return res.status(400).json({ message: invalidMessage });
  }

  const isCodeValid = await bcrypt.compare(code, pending.codeHash);

  if (!isCodeValid) {
    pending.attempts += 1;
    const remaining = MAX_RESET_ATTEMPTS - pending.attempts;

    if (remaining <= 0) {
      pendingPasswordResets.delete(email);
      return res.status(400).json({ message: invalidMessage });
    }

    return res.status(400).json({
      message: `The reset code is incorrect. ${remaining} attempt${remaining === 1 ? '' : 's'} left.`,
    });
  }

  await prisma.user.update({
    where: { email },
    data: { password: await bcrypt.hash(password, 10) },
  });

  pendingPasswordResets.delete(email);

  return res.json({ message: 'Your password has been reset. You can now sign in.' });
});

export default router;
