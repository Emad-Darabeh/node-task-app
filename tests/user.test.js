const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/user');
const { userOneId, userOne, setupDatabase } = require('./fixtures/db');

beforeEach(setupDatabase);

test('Should get profile for user', async () => {
  await request(app)
    .get('/api/v1/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);
});

test('Should not get profile for unauthenticated user', async () => {
  await request(app).get('/api/v1/users/me').send().expect(401);
});

test('Should delete account for user', async () => {
  await request(app)
    .delete('/api/v1/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);

  const user = await User.findById(userOneId);
  expect(user).toBeNull();
});

test('Should not delete account for unauthenticated user', async () => {
  await request(app).delete('/api/v1/users/me').send().expect(401);
});

test('Should upload avatar image', async () => {
  await request(app)
    .post('/api/v1/users/me/avatar')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .attach('avatar', 'tests/fixtures/profile-pic.jpg')
    .expect(200);

  const user = await User.findById(userOneId);
  expect(user.avatar).toEqual(expect.any(Buffer));
});

test('Should update valid user fields', async () => {
  await request(app)
    .patch('/api/v1/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
      name: 'Emad Darabeh',
    })
    .expect(203);

  const user = await User.findById(userOneId);
  expect(user.name).toBe('Emad Darabeh');
});

test('Should not update invalid user fields', async () => {
  await request(app)
    .patch('/api/v1/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
      location: 'New York',
    })
    .expect(400);
});
