const multer = require('multer');
const sharp = require('sharp');
const { Router } = require('express');
const userRouter = Router();

const User = require('../models/user');
const { sendGoodbyeEmail } = require('../emails/account');

// get the current users
userRouter.get('/me', async (req, res) => {
  res.status(200).send(req.user);
});

// get a user by their id
userRouter.get('/:id', async (req, res) => {
  try {
    const _id = req.params.id;
    const user = await User.findById(_id);
    if (!user) return res.status(404).json({ message: 'user not found!' });

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json(error);
  }
});

// update a user by their id
userRouter.patch('/me', async (req, res) => {
  try {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'email', 'password', 'age'];
    const isValidOperation = updates.every((update) =>
      allowedUpdates.includes(update)
    );
    if (!isValidOperation)
      return res.status(400).json({ error: 'invalid update!' });

    const newData = req.body;

    updates.forEach((update) => (req.user[update] = newData[update]));

    await req.user.save();

    res.status(203).json(req.user);
  } catch (error) {
    res.status(400).json(error);
  }
});

userRouter.delete('/me', async (req, res) => {
  try {
    await req.user.remove();
    sendGoodbyeEmail(req.user.email, req.user.name);
    res.json(req.user);
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

const upload = multer({
  limits: {
    fileSize: 1000000,
  },
  fileFilter(req, file, callback) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return callback(new Error('please upload an image'));
    }

    callback(undefined, true);
  },
});

userRouter.post(
  '/me/avatar',
  upload.single('avatar'),
  async (req, res) => {
    const buffer = await sharp(req.file.buffer)
      .resize({ height: 300, width: 300 })
      .png()
      .toBuffer();
    req.user.avatar = buffer;
    await req.user.save();
    res.json({ message: 'image uploaded successfully!' });
  },
  (error, req, res, next) => {
    res.status(400).json({ error: error.message });
  }
);

userRouter.delete('/me/avatar', async (req, res) => {
  req.user.avatar = undefined;
  await req.user.save();
  res.json({ message: 'avatar deleted successfully!' });
});

module.exports = userRouter;
