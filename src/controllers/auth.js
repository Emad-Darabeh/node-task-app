const { sendWelcomeEmail } = require('../emails/account');

const signup = async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    sendWelcomeEmail(user.email, user.name);
    const token = await user.generateAuthToken();

    res.status(201).json({ user, token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

module.exports = {
  signup
}

