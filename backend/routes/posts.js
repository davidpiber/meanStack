const express = require('express');
const router = express.Router();

// Post model
const Post = require('../models/post');

router.post('', async (req, res) => {
  try {
    const { title, content } = req.body;
    const post = new Post({ title, content });
    await post.save();
  res.status(201).json({ postId: post._id });
  } catch (error) {
    console.log(error);
  }
});

router.get('', async (req, res, next) => {
  try {
    const posts = await Post.find();
    res.status(200).json({ posts });
  } catch (error) {
    console.log(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    res.status(200).json(post);
  } catch (error) {
    console.log(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const post = await Post.deleteOne({_id: req.params.id});
    res.status(200).json({ post });
  } catch (error) {
    console.log(error);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { title, content } = req.body;
    const post = await Post.updateOne( { _id: req.params.id }, { title, content });
    res.status(200).json( post );
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
