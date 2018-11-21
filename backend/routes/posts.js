const express = require('express');
const multer = require('multer');
const checkAuth = require('../middleware/checkAuth');

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

router.post('', checkAuth, multer({ storage }).single('image'), async (req, res) => {
  try {
    const url = `${req.protocol}://${req.get('host')}`;
    const { title, content } = req.body;
    const post = new Post({
       title,
       content,
       imagePath: `${url}/images/${req.file.filename}`,
       creator: req.userData.userId });
    await post.save();
    const filteredPost = withOnly(['title', 'content'], post);
    res.status(201).json({ post: { id: post._id, ...filteredPost } });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
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
      return Post.countDocuments();
    }).then((count) => {
      res.status(200).json({ posts: fetchedPosts, maxPosts: count });
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', checkAuth, async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    res.status(200).json(post);
  } catch (error) {
    console.log(error);
  }
});

router.delete('/:id', checkAuth, async (req, res, next) => {
  try {
    const post = await Post.deleteOne({_id: req.params.id, creator: req.userData.userId});
    if (post.n > 0) {
      res.status(200).json({ messsage: 'Delete successfull' });
    } else {
      res.status(401).json({ messsage: 'Not Authorized' });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', checkAuth, multer({ storage }).single('image'), async (req, res, next) => {
  try {
    const { title, content, imagePath } = req.body;
    let path = imagePath;
    if (req.file) {
      const url = `${req.protocol}://${req.get('host')}`;
      path = `${url}/images/${req.file.filename}`;
    }
    const post = await Post.updateOne( { _id: req.params.id, creator: req.userData.userId }, { title, content, imagePath: path, creator: req.userData.userId });
    console.log(post);
    if (post.nModified > 0) {
      res.status(200).json({ messsage: 'Update successfull' });
    } else {
      res.status(401).json({ messsage: 'Not Authorized' });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
