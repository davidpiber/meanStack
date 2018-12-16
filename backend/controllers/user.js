const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

exports.createUser = (req, res) => {
  const { email, password } = req.body;
  bcrypt.hash(password, 10).then(hash => {
    const user = new User({
      email,
      password: hash
    });
    user.save().then(result => {
      res.status(201).json({ user: result });
    }).catch(err => {
      res.status(500).json({ message: 'Invalid authentication credentials' });
    });
  });
}

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user  = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Auth failed' });
    }
    const passCompareResult = await bcrypt.compare(password, user.password);
    if (!passCompareResult) {
      return res.status(401).json({ message: 'Auth failed' });
    }
    const token = jwt.sign(
      { email: user.email, userId: user._id },
      process.env.TOKEN_SECRET,
      { expiresIn: '1h' }
    );
    res.status(200).json({ token, expiresIn: 3600, userId: user._id });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Error Loggin In' });
  }
}
