const path = require('path');
const multer = require('koa-multer');

module.exports = multer({
  dest: path.resolve('./tmp/uploads')
});
