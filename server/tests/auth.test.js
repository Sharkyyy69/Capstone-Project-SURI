import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';

process.env.DATABASE_URL = 'file:./prisma/dev.db';
process.env.JWT_SECRET = 'test-secret';

const { default: app } = await import('../app.js');

test('register endpoint creates a user with a local SQLite database', async () => {
  const server = http.createServer(app);
  const email = `test.${Date.now()}.user@example.com`;

  await new Promise((resolve) => server.listen(0, resolve));
  const { port } = server.address();

  try {
    const response = await fetch(`http://localhost:${port}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        email,
        password: 'Password123!',
      }),
    });

    const payload = await response.json();

    assert.equal(response.status, 201, JSON.stringify(payload));
    assert.ok(payload.token, 'Expected JWT token to be returned');
    assert.equal(payload.user.email, email);
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
});
