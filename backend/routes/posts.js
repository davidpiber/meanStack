const express = require('express');
const checkAuth = require('../middleware/checkAuth');
const PostController = require('../controllers/posts');
const extractFile = require('../middleware/file');
const router = express.Router();

const BY_ID = '/:id';

router.post('', checkAuth, extractFile, PostController.createPost);

router.get('', PostController.getPosts);

router.get(BY_ID, checkAuth, PostController.getPostById);

router.delete(BY_ID, checkAuth, PostController.deleteById);

router.put(BY_ID, extractFile, PostController.editById);

module.exports = router;
