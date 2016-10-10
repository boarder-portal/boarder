const path = require('path');
const multi = require('rollup-plugin-multi-entry');
const npm = require('rollup-plugin-node-resolve');
const json = require('rollup-plugin-json');
const cjs = require('rollup-plugin-commonjs');
const eslint = require('rollup-plugin-eslint');
const babel = require('rollup-plugin-babel');
const inject = require('rollup-plugin-inject');
const pug = require('rollup-plugin-pug');
const glob = require('glob');

const modules = glob.sync('./app/client/modules/!(base|404|confirm-register).js', { root: path.resolve('./') });

module.exports = {
  entry: [
    './app/client/modules/confirm-register.js',
    ...modules,
    './app/client/modules/404.js',
    './app/client/modules/base.js',
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
    eslint({
      include: './app/**/*.js'
    }),
    cjs({
      include: [
        './node_modules/**/*.js',
        './app/shared/**/*.js'
      ],
      exclude: './node_modules/rollup-plugin-node-builtins/**/*.js'
    }),
    babel({
      include: './app/**/*.@(js|pug)'
    }),
    inject({
      exclude: './node_modules/dwayne/lib/constants/global.js',
      modules: {
        global: path.resolve('./node_modules/dwayne/lib/constants/global.js')
      }
    })
  ]
};
