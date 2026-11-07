import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';

process.env.DATABASE_URL = 'file:./prisma/dev.db';
process.env.JWT_SECRET = 'test-secret';
// Never send real email from tests, even if a local .env has SMTP credentials.
// dotenv does not overwrite variables that are already set.
process.env.SMTP_USER = '';
process.env.SMTP_PASS = '';

const { default: app } = await import('../app.js');

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

async function withServer(run) {
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const { port } = server.address();

  const post = async (path, body) => {
    const response = await fetch(`http://localhost:${port}/api/auth${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return { status: response.status, body: await response.json() };
  };

  try {
    await run(post);
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
}

async function createUser(post, email, password) {
  const registered = await post('/register', { name: 'Reset User', email, password });
  const verified = await post('/verify-registration', { email, code: registered.body.code });
  assert.equal(verified.status, 201, JSON.stringify(verified.body));
}

test('forgot and reset password lets a user sign in with the new password', async () => {
  await withServer(async (post) => {
    const email = `reset.${Date.now()}.user@example.com`;
    await createUser(post, email, 'OldPassword1!');

    const forgot = await post('/forgot-password', { email });
    assert.equal(forgot.status, 200, JSON.stringify(forgot.body));
    assert.match(forgot.body.code, /^\d{6}$/);

    const tooShort = await post('/reset-password', { email, code: forgot.body.code, password: 'short' });
    assert.equal(tooShort.status, 400);

    const reset = await post('/reset-password', { email, code: forgot.body.code, password: 'NewPassword1!' });
    assert.equal(reset.status, 200, JSON.stringify(reset.body));

    const oldLogin = await post('/login', { email, password: 'OldPassword1!' });
    assert.equal(oldLogin.status, 401);

    const newLogin = await post('/login', { email, password: 'NewPassword1!' });
    assert.equal(newLogin.status, 200, JSON.stringify(newLogin.body));
    assert.ok(newLogin.body.token);

    const reused = await post('/reset-password', { email, code: forgot.body.code, password: 'Another1!pass' });
    assert.equal(reused.status, 400, 'A reset code must only work once');
  });
});

test('forgot password does not reveal whether an email is registered', async () => {
  await withServer(async (post) => {
    const unknown = await post('/forgot-password', { email: `nobody.${Date.now()}@example.com` });
    assert.equal(unknown.status, 200);
    assert.equal(unknown.body.code, undefined);
    assert.match(unknown.body.message, /If an account exists/);
  });
});

test('reset code is invalidated after too many wrong attempts', async () => {
  await withServer(async (post) => {
    const email = `lockout.${Date.now()}.user@example.com`;
    await createUser(post, email, 'OldPassword1!');

    const forgot = await post('/forgot-password', { email });
    const wrongCode = forgot.body.code === '000000' ? '111111' : '000000';

    for (let attempt = 0; attempt < 5; attempt += 1) {
      const result = await post('/reset-password', { email, code: wrongCode, password: 'NewPassword1!' });
      assert.equal(result.status, 400);
    }

    const correctButLocked = await post('/reset-password', {
      email,
      code: forgot.body.code,
      password: 'NewPassword1!',
    });
    assert.equal(correctButLocked.status, 400);
    assert.match(correctButLocked.body.message, /invalid or has expired/);
  });
});

test('registration rejects passwords shorter than 8 characters', async () => {
  await withServer(async (post) => {
    const result = await post('/register', {
      name: 'Short Password',
      email: `short.${Date.now()}@example.com`,
      password: 'Abc123!',
    });
    assert.equal(result.status, 400);
    assert.match(result.body.message, /at least 8 characters/);
    assert.equal(result.body.code, undefined);
  });
});
