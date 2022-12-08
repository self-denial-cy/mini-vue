const path = require('path');
const resolve = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const babel = require('@rollup/plugin-babel');
const { terser } = require('rollup-plugin-terser');
const clear = require('rollup-plugin-clear');
const progress = require('rollup-plugin-progress');
const sizes = require('rollup-plugin-sizes');
const filesize = require('rollup-plugin-filesize');
const pkg = require('./package.json');

const isProd = process.env.NODE_ENV === 'production';

module.exports = [
  {
    input: path.join(__dirname, './src/index.js'),
    output: {
      name: 'Vue',
      file: path.join(__dirname, pkg.browser),
      format: 'iife',
      sourcemap: !isProd
    },
    plugins: [
      resolve(), // so Rollup can find module from node_modules
      commonjs(), // so Rollup can convert module from node_modules to an ES module
      babel({
        exclude: ['node_modules/**'],
        babelHelpers: 'bundled',
        presets: [['@babel/preset-env', {
          useBuiltIns: false,
          modules: false
        }]],
        plugins: [['@babel/plugin-transform-runtime', {
          corejs: 3,
          helpers: false,
          regenerator: false, // helpers 为 false 时，regenerator 参数无效
          version: '^7.8.4'
        }]]
      }),
      isProd ? terser() : null,
      clear({
        targets: ['dist']
      }),
      progress(),
      sizes(),
      filesize()
    ]
  },
  {
    input: path.join(__dirname, './src/index.js'),
    output: {
      file: path.join(__dirname, pkg.module),
      format: 'es',
      sourcemap: !isProd
    },
    plugins: [
      resolve(),
      commonjs(),
      babel({
        exclude: ['node_modules/**'],
        babelHelpers: 'runtime',
        presets: [['@babel/preset-env', {
          useBuiltIns: false,
          modules: false
        }]],
        plugins: [['@babel/plugin-transform-runtime', {
          corejs: 3,
          helpers: true,
          regenerator: true,
          version: '^7.8.4'
        }]]
      }),
      isProd ? terser() : null,
      clear({
        targets: ['dist']
      }),
      progress(),
      sizes(),
      filesize()
    ],
    external: id => id.includes('@babel/runtime-corejs3')
  }
];
