const multer = require('multer');

const VALID_IMAGE_TYPES = {
  'image/png': 'png',
  'image/jpeg': 'jpeg',
  'image/jpeg': 'jpeg'
};

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

module.exports = multer({ storage }).single('image');
