'use strict';

module.exports = {
  root: true,
  extends: 'fatfisz',
  rules: {
    'no-console': 'warn',
  },
  overrides: [
    {
      files: '**/*.js',
      parserOptions: {
        sourceType: 'script',
      },
      env: {
        node: true,
      },
    },
    {
      files: ['rollup*.config.js', 'rollup-plugins/**'],
      parserOptions: {
        sourceType: 'module',
      },
      rules: {
        'import/no-default-export': 'off',
      },
    },
  ],
};
