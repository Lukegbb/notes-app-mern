const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../src/app');

const MONGO_URI = process.env.MONGO_URI_TEST || 'mongodb://127.0.0.1:27017/notes_test';

beforeAll(async () => {
  await mongoose.connect(MONGO_URI);
  await mongoose.connection.dropDatabase();
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
});

async function registerUser(email = 'lucas@example.com') {
  const res = await request(app)
    .post('/api/auth/register')
    .send({ name: 'Lucas', email, password: 'Str0ngPass!' });
  return res.body.token;
}

describe('Auth', () => {
  test('registers and logs in a user', async () => {
    const register = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Ana', email: 'ana@example.com', password: 'Str0ngPass!' });
    expect(register.status).toBe(201);
    expect(register.body.token).toBeDefined();
    expect(register.body.user.password).toBeUndefined();

    const login = await request(app)
      .post('/api/auth/login')
      .send({ email: 'ana@example.com', password: 'Str0ngPass!' });
    expect(login.status).toBe(200);
    expect(login.body.token).toBeDefined();
  });

  test('rejects duplicate emails and wrong passwords', async () => {
    const duplicate = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Ana', email: 'ana@example.com', password: 'Str0ngPass!' });
    expect(duplicate.status).toBe(409);

    const wrong = await request(app)
      .post('/api/auth/login')
      .send({ email: 'ana@example.com', password: 'wrong-password' });
    expect(wrong.status).toBe(401);
  });
});

describe('Notes', () => {
  let token;
  let otherToken;

  beforeAll(async () => {
    token = await registerUser('owner@example.com');
    otherToken = await registerUser('other@example.com');
  });

  test('requires authentication', async () => {
    const res = await request(app).get('/api/notes');
    expect(res.status).toBe(401);
  });

  test('creates, lists, updates and deletes a note', async () => {
    const created = await request(app)
      .post('/api/notes')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Interview prep', content: 'Review Django and React', tags: ['Career'] });
    expect(created.status).toBe(201);
    expect(created.body.tags).toEqual(['career']);

    const list = await request(app).get('/api/notes').set('Authorization', `Bearer ${token}`);
    expect(list.status).toBe(200);
    expect(list.body.total).toBe(1);

    const updated = await request(app)
      .patch(`/api/notes/${created.body._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ pinned: true });
    expect(updated.status).toBe(200);
    expect(updated.body.pinned).toBe(true);

    const removed = await request(app)
      .delete(`/api/notes/${created.body._id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(removed.status).toBe(204);
  });

  test('searches notes by text and tag', async () => {
    const auth = { Authorization: `Bearer ${token}` };
    await request(app).post('/api/notes').set(auth).send({ title: 'Shopping list', tags: ['home'] });
    await request(app).post('/api/notes').set(auth).send({ title: 'Docker notes', tags: ['dev'] });

    const bySearch = await request(app).get('/api/notes?search=docker').set(auth);
    expect(bySearch.body.total).toBe(1);
    expect(bySearch.body.items[0].title).toBe('Docker notes');

    const byTag = await request(app).get('/api/notes?tag=home').set(auth);
    expect(byTag.body.total).toBe(1);
  });

  test("users cannot access other users' notes", async () => {
    const note = await request(app)
      .post('/api/notes')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Private' });

    const res = await request(app)
      .get(`/api/notes/${note.body._id}`)
      .set('Authorization', `Bearer ${otherToken}`);
    expect(res.status).toBe(404);
  });

  test('validates required fields', async () => {
    const res = await request(app)
      .post('/api/notes')
      .set('Authorization', `Bearer ${token}`)
      .send({ content: 'No title' });
    expect(res.status).toBe(400);
  });
});
