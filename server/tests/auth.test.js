import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import bcrypt from 'bcryptjs';

process.env.DATABASE_URL = 'file:./prisma/dev.db';
process.env.JWT_SECRET = 'test-secret';

const { default: app } = await import('../app.js');
const prisma = (await import('../config/prisma.js')).default;

test('register and verify endpoints create a user with a local SQLite database', async () => {
  const server = http.createServer(app);
  const email = `test.${Date.now()}.user@example.com`;

  await new Promise((resolve) => server.listen(0, resolve));
  const { port } = server.address();

  try {
    const registerResponse = await fetch(`http://localhost:${port}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        email,
        password: 'Password123!',
      }),
    });

    const registerPayload = await registerResponse.json();

    assert.equal(registerResponse.status, 200, JSON.stringify(registerPayload));
    assert.ok(registerPayload.code, 'Expected a verification code to be generated');
    assert.equal(registerPayload.email, email);

    const verifyResponse = await fetch(`http://localhost:${port}/api/auth/verify-registration`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        code: registerPayload.code,
      }),
    });

    const verifyPayload = await verifyResponse.json();

    assert.equal(verifyResponse.status, 201, JSON.stringify(verifyPayload));
    assert.ok(verifyPayload.token, 'Expected JWT token to be returned');
    assert.equal(verifyPayload.user.email, email);
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
});

test('forgot-password and reset-password flow updates the user password', async () => {
  const server = http.createServer(app);
  const email = `test.${Date.now()}.reset@example.com`;
  const originalPassword = 'Password123!';
  const newPassword = 'NewPassword456!';

  await prisma.user.create({
    data: {
      name: 'Reset User',
      email,
      password: await bcrypt.hash(originalPassword, 10),
    },
  });

  await new Promise((resolve) => server.listen(0, resolve));
  const { port } = server.address();

  try {
    const forgotResponse = await fetch(`http://localhost:${port}/api/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    const forgotPayload = await forgotResponse.json();

    assert.equal(forgotResponse.status, 200, JSON.stringify(forgotPayload));
    assert.ok(forgotPayload.code, 'Expected a forgot password code to be generated');
    assert.equal(forgotPayload.email, email);

    const resetResponse = await fetch(`http://localhost:${port}/api/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        code: forgotPayload.code,
        password: newPassword,
      }),
    });

    const resetPayload = await resetResponse.json();

    assert.equal(resetResponse.status, 200, JSON.stringify(resetPayload));
    assert.match(resetPayload.message, /updated/i);

    const loginResponse = await fetch(`http://localhost:${port}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password: newPassword,
      }),
    });

    const loginPayload = await loginResponse.json();

    assert.equal(loginResponse.status, 200, JSON.stringify(loginPayload));
    assert.equal(loginPayload.user.email, email);
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
});
