const gulp = require('gulp');
const webpack = require('webpack');
const webpackConfig = require('../webpack.config');

gulp.task('watch:client', () => {
  const { emit } = require('../app/server/helpers/livereload');
  const compiler = webpack(webpackConfig);

  compiler.watch({}, () => {});

  compiler.plugin('compile', ()  => {
    console.log('start compiling...');
    emit('toreload');
  });

  compiler.plugin('done', (stats)  => {
    console.log(stats.toString({
      chunks: false,
      colors: true
    }));
    emit('reload');
  });
});
