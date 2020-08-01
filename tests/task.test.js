const request = require('supertest');
const app = require('../src/app');
const Task = require('../src/models/task');
const {
  userOneId,
  userOne,
  setupDatabase,
  taskThree,
} = require('./fixtures/db');

beforeEach(setupDatabase);

test('Should create task for user', async () => {
  const response = await request(app)
    .post('/api/v1/tasks')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
      description: 'this is a test task description',
    })
    .expect(201);

  const task = await Task.findById(response.body._id);
  expect(task).not.toBeNull();

  expect(task.completed).toEqual(false);
});

test('Should fetch user tasks', async () => {
  const response = await request(app)
    .get('/api/v1/tasks')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);

  expect(response.body.length).toEqual(2);
});

test('Should not delete other users tasks', async () => {
  await request(app)
    .delete(`/api/v1/tasks/${taskThree._id}`)
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(404);

  const task = await Task.findById(taskThree._id);
  expect(task).not.toBeNull();
});
