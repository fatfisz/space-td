import { resolve } from 'path';

import nodeResolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import typescript from '@rollup/plugin-typescript';
import livereload from 'rollup-plugin-livereload';
import serve from 'rollup-plugin-serve';
import { terser } from 'rollup-plugin-terser';

import prependHtml from './rollup-plugins/prependHtml';

const isProduction = process.env.NODE_ENV === 'production';

export default {
  input: 'src/index.ts',
  plugins: [
    nodeResolve({
      extensions: ['.ts'],
      customResolveOptions: {
        moduleDirectories: [resolve('./src'), 'node_modules'],
      },
    }),
    replace({
      'process.env.NODE_ENV': JSON.stringify(isProduction ? 'production' : 'development'),
    }),
    typescript(),
    isProduction
      ? terser({
          compress: {
            passes: 5,
            pure_getters: true,
          },
        })
      : null,
    prependHtml(),
    isProduction ? null : serve({ open: true }),
    isProduction ? null : livereload(),
  ],
  output: {
    file: 'index.html',
    format: 'cjs',
    inlineDynamicImports: true,
  },
};
