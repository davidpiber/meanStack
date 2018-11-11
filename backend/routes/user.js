const express = require('express');
const User = require('../models/user');

const router = express.Router();

router.post('/signup', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      // throw new Error("Whoops!");
      throw new Error('Invalid Email or Password');
    }
    const user = new User({ email, password });
    await user.save();
    res.status(200).json({ user });
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
