const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const router = express.Router();

const TOKEN_SECRET = 'djhth,###A%((##*%NKJKJ';

router.post('/signup', (req, res) => {
    const { email, password } = req.body;
    bcrypt.hash(password, 10).then(hash => {
      const user = new User({
        email,
        password: hash
      });
      user.save().then(result => {
        res.status(201).json({ user: result });
      }).catch(err => {
        res.status(500).json({ error: err });
      });
    });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  User.find({ email }).then(user => {
    if (!user) {
      res.status(401).json({ message: 'Auth failed' });
    }
    return bcrypt.compare(password, user.password)
  }).then(result => {
    if (!result) {
      return res.status(401).json({ message: 'Auth failed' });
    }
    const token = jwt.sign(
      { email: user.email, userId: user._id },
      TOKEN_SECRET,
      { expiresIn: '1h' }
    );
    res.status(200).json({ token });
  }).catch(err => {
    return res.status(500).json({ error: err });
  });
});

module.exports = router;
