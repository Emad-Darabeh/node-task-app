const { Router } = require('express');
const authRouter = Router();
const User = require('../models/user');
const jwtProtect = require('../middleware/jwtProtect');
const { sendWelcomeEmail } = require('../emails/account');

authRouter.post('/signup', async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    sendWelcomeEmail(user.email, user.name);
    const token = await user.generateAuthToken();

    res.status(201).json({ user, token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

authRouter.post('/signin', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: 'invalid credentials!' });

    const user = await User.findByCredentials(email, password);
    const token = await user.generateAuthToken();
    res.json({ user, token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

authRouter.post('/signout', jwtProtect, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter(
      (token) => token.token !== req.token
    );
    await req.user.save();
    res.json({ message: 'singed out successfully!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

authRouter.post('/signoutAll', jwtProtect, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.json({ message: 'singed out successfully!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = authRouter;
