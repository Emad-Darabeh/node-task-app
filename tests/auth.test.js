const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/user');
const { userOneId, userOne, setupDatabase } = require('./fixtures/db');

beforeEach(setupDatabase);

// test the signup endpoint
test('Should signup a new user', async () => {
  const response = await request(app)
    .post('/api/v1/auth/signup')
    .send({
      name: 'osama',
      email: 'osama@email.com',
      password: '123456789',
    })
    .expect(201);

  // assert that the database was changes correctly
  const user = await User.findById(response.body.user._id);
  expect(user).not.toBeNull();

  expect(response.body).toMatchObject({
    user: {
      name: 'osama',
      email: 'osama@email.com',
    },
    token: user.tokens[0].token,
  });

  expect(user.password).not.toBe('123456789');
});

// test the signin endpoint
test('Should signin existing user', async () => {
  const response = await request(app)
    .post('/api/v1/auth/signin')
    .send({
      email: userOne.email,
      password: userOne.password,
    })
    .expect(200);

  const user = await User.findById(userOneId);
  expect(response.body.token).toBe(user.tokens[1].token);
});

test('Should not signin none existing user', async () => {
  await request(app)
    .post('/api/v1/auth/signin')
    .send({
      email: 'nonesisting@email.com',
      password: '123456789',
    })
    .expect(400);
});
