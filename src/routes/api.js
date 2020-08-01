const { Router } = require('express');
const apiRouter = Router();

const jwtProtect = require('../middleware/jwtProtect');

const authRouter = require('./auth');
const userRouter = require('./user');
const taskRouter = require('./task');

const User = require('../models/user');

apiRouter.get('/api/v1/users/:id/avatar', async (req, res) => {
  try {
    const _id = req.params.id;
    const user = await User.findById(_id);

    if (!user) throw new Error('user not found');
    if (!user.avatar) throw new Error('user avatar not found');

    res.set('Content-Type', 'image/png');
    res.send(user.avatar);
  } catch (error) {
    res.status(404).send({ error: error.message });
  }
});

apiRouter.use('/api/v1/auth', authRouter);
apiRouter.use('/api/v1/users', jwtProtect, userRouter);
apiRouter.use('/api/v1/tasks', jwtProtect, taskRouter);

module.exports = apiRouter;
