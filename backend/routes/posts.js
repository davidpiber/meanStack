const express = require('express');
const multer = require('multer');

const VALID_IMAGE_TYPES = {
  'image/png': 'png',
  'image/jpeg': 'jpeg',
  'image/jpeg': 'jpeg'
};

const withOnly = (keys, object) => {
  let result = {};
  keys.forEach((prop) => {
		if (object.hasOwnProperty(prop)) {
			result[prop] = object[prop];
		}
	});
  return result;
}

const router = express.Router();
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isValid = VALID_IMAGE_TYPES[file.mimetype];
    let error = new Error('Invalid image type');
    if (isValid) {
      error = null;
    }
    cb(error, 'backend/images')
   },
   filename: (req, file, cb) => {
    const name = file.originalname.toLowerCase().split(' ').join('-');
    const ext = VALID_IMAGE_TYPES[file.mimetype];
    cb(null, `${name}-${Date.now()}.${ext}`);
   }
});

// Post model
const Post = require('../models/post');

router.post('', multer({ storage }).single('image'), async (req, res) => {
  try {
    const url = `${req.protocol}://${req.get('host')}`;
    const { title, content } = req.body;
    const post = new Post({ title, content, imagePath: `${url}/images/${req.file.filename}` });
    await post.save();
    const filteredPost = withOnly(['title', 'content'], post);
    res.status(201).json({ post: { id: post._id, ...filteredPost } });
  } catch (error) {
    console.log(error);
  }
});

router.get('', (req, res, next) => {
  try {
    const page = Number(req.query.page);
    const pageSize = Number(req.query.pageSize);
    const postQuery = Post.find();
    let fetchedPosts;
    if (page && pageSize) {
      postQuery.skip(pageSize * (page - 1)).limit(pageSize);
    }
    postQuery.then(posts => {
      fetchedPosts = posts;
      return Post.count();
    }).then((count) => {
      res.status(200).json({ posts: fetchedPosts, maxPosts: count });
    });
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

router.put('/:id', multer({ storage }).single('image'), async (req, res, next) => {
  try {
    const { title, content, imagePath } = req.body;
    let path = imagePath;
    if (req.file) {
      const url = `${req.protocol}://${req.get('host')}`;
      path = `${url}/images/${req.file.filename}`;
    }
    const post = await Post.updateOne( { _id: req.params.id }, { title, content, imagePath: path });
    res.status(200).json( { post } );
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
