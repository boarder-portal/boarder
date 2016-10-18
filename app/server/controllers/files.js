const path = require('path');
const multer = require('multer');

module.exports = multer({
  dest: path.resolve('./tmp/uploads')
});
