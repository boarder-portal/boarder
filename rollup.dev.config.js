const path = require('path');
const multi = require('rollup-plugin-multi-entry');
const npm = require('rollup-plugin-node-resolve');
const json = require('rollup-plugin-json');
const cjs = require('rollup-plugin-commonjs');
const eslint = require('rollup-plugin-eslint');
const babel = require('rollup-plugin-babel');
const inject = require('rollup-plugin-inject');
const pug = require('rollup-plugin-pug');
const less = require('rollup-plugin-less');

module.exports = {
  entry: [
    './app/client/index.js',
    './app/client/plugins/livereload.js'
  ],
  dest: './public/js/all.js',
  format: 'iife',
  moduleName: 'boarder',
  sourceMap: true,
  plugins: [
    multi(),
    npm({
      browser: true,
      preferBuiltins: false
    }),
    json({
      include: './**/*.json'
    }),
    pug({
      include: './**/*.pug',
      inlineFunctions: true
    }),
    less({
      include: './**/*.less',
      insert: true
    }),
    cjs({
      include: 'node_modules/**',
      exclude: 'node_modules/rollup-plugin-node-builtins/**'
    }),
    eslint({
      include: './**/*.js'
    }),
    babel({
      presets: ['es2015-rollup', 'stage-0'],
      include: './**/*.js',
      plugins: ['transform-class-properties'],
      babelrc: false
    }),
    inject({
      exclude: './node_modules/dwayne/lib/constants/global.js',
      modules: {
        global: path.resolve('./node_modules/dwayne/lib/constants/global.js')
      }
    })
  ]
};
