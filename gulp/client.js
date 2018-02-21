import webpack from 'webpack';

import webpackConfig from '../webpack.config';

export async function watchClient() {
  const { emit } = await import('../app/server/helpers/livereload');
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
}
