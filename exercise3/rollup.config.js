const path = require('path');
const resolve = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const babel = require('@rollup/plugin-babel');
const { terser } = require('rollup-plugin-terser');
const clear = require('rollup-plugin-clear');
const progress = require('rollup-plugin-progress');
const sizes = require('rollup-plugin-sizes');
const filesize = require('rollup-plugin-filesize');
const eslint = require('@rollup/plugin-eslint');
const pkg = require('./package.json');

const isProd = process.env.NODE_ENV === 'production';

module.exports = [
  {
    input: path.join(__dirname, './src/index.js'),
    output: {
      name: 'Vuex',
      file: isProd ? path.join(__dirname, pkg.browser) : path.join(__dirname, path.join('./examples', pkg.browser)),
      format: 'iife',
      sourcemap: !isProd
    },
    plugins: [
      resolve(), // so Rollup can find module from node_modules
      commonjs(), // so Rollup can convert module from node_modules to an ES module
      babel({
        exclude: ['node_modules/**'],
        babelHelpers: 'bundled',
        presets: [
          [
            '@babel/preset-env',
            {
              useBuiltIns: false,
              modules: false
            }
          ]
        ],
        plugins: [
          [
            '@babel/plugin-transform-runtime',
            {
              corejs: 3,
              helpers: false,
              regenerator: false, // helpers 为 false 时，regenerator 参数无效
              version: '^7.8.4'
            }
          ]
        ]
      }),
      isProd ? terser() : null,
      clear({
        targets: ['dist', 'examples/dist']
      }),
      progress(),
      sizes(),
      filesize(),
      eslint()
    ]
  },
  {
    input: path.join(__dirname, './src/index.js'),
    output: {
      file: isProd ? path.join(__dirname, pkg.module) : path.join(__dirname, path.join('./examples', pkg.module)),
      format: 'es',
      sourcemap: !isProd
    },
    plugins: [
      resolve(),
      commonjs(),
      babel({
        exclude: ['node_modules/**'],
        babelHelpers: 'runtime',
        presets: [
          [
            '@babel/preset-env',
            {
              useBuiltIns: false,
              modules: false
            }
          ]
        ],
        plugins: [
          [
            '@babel/plugin-transform-runtime',
            {
              corejs: 3,
              helpers: true,
              regenerator: true,
              version: '^7.8.4'
            }
          ]
        ]
      }),
      isProd ? terser() : null,
      clear({
        targets: ['dist', 'examples/dist']
      }),
      progress(),
      sizes(),
      filesize(),
      eslint()
    ],
    external: (id) => id.includes('@babel/runtime-corejs3')
  }
];
