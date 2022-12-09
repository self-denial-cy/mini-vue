module.exports = {
  root: true,
  parserOptions: {
    parser: '@babel/eslint-parser',
    sourceType: 'module',
    ecmaVersion: 6,
    ecmaFeatures: {
      globalReturn: false,
      impliedStrict: true,
      jsx: false
    }
  },
  globals: {},
  env: {
    es6: true,
    browser: true,
    node: true
  },
  rules: {
    'no-useless-escape': 0,
    'no-unused-vars': 0
  },
  extends: ['eslint:recommended', 'plugin:prettier/recommended'],
  plugins: ['@babel/eslint-plugin']
};
