import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import bcrypt from 'bcryptjs';

process.env.DATABASE_URL = 'file:./prisma/dev.db';
process.env.JWT_SECRET = 'test-secret';
// Never send real emails from tests (dotenv won't override values already set).
process.env.SMTP_USER = '';
process.env.SMTP_PASS = '';

const { default: app } = await import('../app.js');
const prisma = (await import('../config/prisma.js')).default;

async function withServer(run) {
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const post = async (path, body) => {
    const response = await fetch(`http://localhost:${server.address().port}/api/auth${path}`, {
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

async function createUser(email, password) {
  await prisma.user.create({
    data: { name: 'Test User', email, password: await bcrypt.hash(password, 10) },
  });
}

test('register and verify endpoints create a user with a local SQLite database', async () => {
  const email = `test.${Date.now()}.user@example.com`;

  await withServer(async (post) => {
    const register = await post('/register', { name: 'Test User', email, password: 'Password123!' });
    assert.equal(register.status, 200, JSON.stringify(register.body));
    assert.ok(register.body.code, 'Expected a verification code to be generated');
    assert.equal(register.body.email, email);

    const verify = await post('/verify-registration', { email, code: register.body.code });
    assert.equal(verify.status, 201, JSON.stringify(verify.body));
    assert.ok(verify.body.token, 'Expected JWT token to be returned');
    assert.equal(verify.body.user.email, email);
  });
});

test('register rejects names containing numbers or symbols', async () => {
  await withServer(async (post) => {
    for (const name of ['John123', 'Jane_Doe', 'Mark!', '@dmin', '12345', 'A']) {
      const { status, body } = await post('/register', {
        name,
        email: `test.${Date.now()}.name@example.com`,
        password: 'Password123!',
      });
      assert.equal(status, 400, `Expected "${name}" to be rejected`);
      assert.ok(body.errors.name, `Expected a name error for "${name}"`);
    }
  });
});

test('register rejects invalid emails and weak passwords', async () => {
  await withServer(async (post) => {
    const badEmail = await post('/register', { name: 'Juan Dela Cruz', email: 'not-an-email', password: 'Password123' });
    assert.equal(badEmail.status, 400);
    assert.ok(badEmail.body.errors.email);

    for (const password of ['short1', 'allletters', '12345678', 'has space1']) {
      const { status, body } = await post('/register', {
        name: 'Juan Dela Cruz',
        email: `test.${Date.now()}.pw@example.com`,
        password,
      });
      assert.equal(status, 400, `Expected password "${password}" to be rejected`);
      assert.ok(body.errors.password);
    }
  });
});

test('register reports an already-registered email on the email field', async () => {
  const email = `test.${Date.now()}.dupe@example.com`;
  await createUser(email, 'Password123!');

  try {
    await withServer(async (post) => {
      const { status, body } = await post('/register', { name: 'Juan Dela Cruz', email, password: 'Password123' });
      assert.equal(status, 409);
      assert.ok(body.errors.email);
    });
  } finally {
    await prisma.user.delete({ where: { email } });
  }
});

test('login reports a wrong password and an unknown email separately', async () => {
  const email = `test.${Date.now()}.login@example.com`;
  await createUser(email, 'Password123!');

  try {
    await withServer(async (post) => {
      const wrongPassword = await post('/login', { email, password: 'WrongPass999' });
      assert.equal(wrongPassword.status, 401);
      assert.match(wrongPassword.body.errors.password, /incorrect password/i);

      const unknownEmail = await post('/login', { email: `nobody.${Date.now()}@example.com`, password: 'Password123!' });
      assert.equal(unknownEmail.status, 401);
      assert.ok(unknownEmail.body.errors.email);

      const badFormat = await post('/login', { email: 'nope', password: 'Password123!' });
      assert.equal(badFormat.status, 400);

      const correct = await post('/login', { email, password: 'Password123!' });
      assert.equal(correct.status, 200);
    });
  } finally {
    await prisma.user.delete({ where: { email } });
  }
});

test('forgot-password and reset-password flow updates the user password', async () => {
  const email = `test.${Date.now()}.reset@example.com`;
  const newPassword = 'NewPassword456!';
  await createUser(email, 'Password123!');

  await withServer(async (post) => {
    const forgot = await post('/forgot-password', { email });
    assert.equal(forgot.status, 200, JSON.stringify(forgot.body));
    assert.ok(forgot.body.code, 'Expected a forgot password code to be generated');
    assert.equal(forgot.body.email, email);

    const reset = await post('/reset-password', { email, code: forgot.body.code, password: newPassword });
    assert.equal(reset.status, 200, JSON.stringify(reset.body));
    assert.match(reset.body.message, /updated/i);

    const login = await post('/login', { email, password: newPassword });
    assert.equal(login.status, 200, JSON.stringify(login.body));
    assert.equal(login.body.user.email, email);
  });
});
