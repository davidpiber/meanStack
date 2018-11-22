const jwt = require('jsonwebtoken');

const TOKEN_SECRET = 'djhth,###A%((##*%NKJKJ';

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const { email, userId } = jwt.verify(token, TOKEN_SECRET);
    req.userData = { email, userId };
    next();
  } catch (error) {
    res.status(401).json({ message: 'You are not authenticated' })
  }
};
