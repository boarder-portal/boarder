import path from 'path';
import multer from 'koa-multer';

export default multer({
  dest: path.resolve('./tmp/uploads')
});
