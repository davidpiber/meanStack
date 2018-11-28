const express = require('express');
const multer = require('multer');
const checkAuth = require('../middleware/checkAuth');
const PostController = require('../controllers/posts');

const VALID_IMAGE_TYPES = {
  'image/png': 'png',
  'image/jpeg': 'jpeg',
  'image/jpeg': 'jpeg'
};

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

router.post('', checkAuth, multer({ storage }).single('image'), PostController.createPost);

router.get('', PostController.getPosts);

router.get('/:id', checkAuth, PostController.getPostById);

router.delete('/:id', checkAuth, PostController.deleteById);

router.put('/:id', checkAuth, multer({ storage }).single('image'), PostController.editById);

module.exports = router;
