const path = require('path');
const fs = require('fs-promise');
const http = require('http');
const gulp = require('gulp');

const User = require('../app/server/db/models/user');

const ATTACHMENTS_DIR = path.resolve('./public/attachments');

gulp.task('create:attachments', () => (
  User.findAll({})
    .then((users) => (
      Promise.all(
        users.map(({ id }) => {
          const dir = `${ ATTACHMENTS_DIR }/users/${ id }`;

          return fs.ensureDir(dir)
            .then(() => (
              new Promise((resolve) => {
                const stream = fs.createWriteStream(`${ dir }/0.png`);

                http.get('http://findicons.com/files/icons/1072/face_avatars/300/a05.png', (res) => {
                  res.pipe(stream);

                  stream.on('end', resolve);
                });
              })
            ));
        })
      )
    ))
));
