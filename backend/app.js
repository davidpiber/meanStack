const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const MONGO_USER = 'dbermudez';
const MONGO_PASS = 'O2VrpbTX3MZjkqzs';
const CONNECTION_STRING = `mongodb+srv://${MONGO_USER}:${MONGO_PASS}@cluster0-noxkx.mongodb.net/test?retryWrites=true`;
mongoose.connect(CONNECTION_STRING).then(() => {
  console.log('Connected to database!');
}).catch(() => {
  console.log('Connection failed');
});

// Post model
const Post = require('./models/post');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers',
   'Origin, X-Requested-With, Content-Type, Accept');
  res.setHeader('Access-Control-Allow-Methods',
   'GET,POST,DELETE,PUT,PATCH,OPTIONS');
  next();
});

app.post('/posts', (req, res) => {
  const { title, content } = req.body;
  const post = new Post({ title, content });
  post.save();
  res.status(201).json({
    message: 'post added successfully'
  });
});

app.get('/posts', async (req, res, next) => {
  try {
    const posts = await Post.find();
    res.status(200).json({ posts });
  } catch (error) {
    console.log(error);
  }
});

module.exports = app;
