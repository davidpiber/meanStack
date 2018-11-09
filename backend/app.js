const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const postRoutes = require('./routes/posts');
const userRoutes = require('./routes/user');

const MONGO_USER = 'dbermudez';
const MONGO_PASS = 'O2VrpbTX3MZjkqzs';
const CONNECTION_STRING = `mongodb+srv://${MONGO_USER}:${MONGO_PASS}@cluster0-noxkx.mongodb.net/test?retryWrites=true`;

mongoose.connect(CONNECTION_STRING, { useNewUrlParser: true }).then(() => {
  console.log('Connected to database!');
}).catch(() => {
  console.log('Connection failed');
});

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/images', express.static(path.join('backend/images')));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers',
   'Origin, X-Requested-With, Content-Type, Accept');
  res.setHeader('Access-Control-Allow-Methods',
   'GET,POST,DELETE,PUT,PATCH,OPTIONS');
  next();
});

app.use('/api/posts', postRoutes);
app.use('/api/users', userRoutes);

module.exports = app;
