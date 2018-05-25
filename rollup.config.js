/* eslint-disable flowtype/require-valid-file-annotation, no-console, import/extensions */
import nodeResolve from 'rollup-plugin-node-resolve'
import replace from 'rollup-plugin-replace'
import commonjs from 'rollup-plugin-commonjs'
import babel from 'rollup-plugin-babel'
import json from 'rollup-plugin-json'
import uglify from 'rollup-plugin-uglify'
import visualizer from 'rollup-plugin-visualizer'
import sourceMaps from 'rollup-plugin-sourcemaps'

const commonPlugins = [
  json(),
  nodeResolve(),
  sourceMaps(),
  babel({ plugins: ['external-helpers'] }),
  commonjs({ ignoreGlobal: true }),
]

const globals = {
  'graphql-tag': 'gql',
  graphql: 'graphql',
  'graphql-tools': 'graphqlTools',
  'graphql/language': 'graphqlLanguage',
}

const configBase = {
  input: 'src/index.js',
  external: Object.keys(globals),
  plugins: commonPlugins,
}

const umdConfig = Object.assign({}, configBase, {
  output: {
    file: 'dist/fraql.js',
    format: 'umd',
    name: 'fraql',
    exports: 'named',
    sourcemap: true,
    globals,
  },
})

const devUmdConfig = Object.assign({}, umdConfig, {
  plugins: umdConfig.plugins.concat(
    replace({
      'process.env.NODE_ENV': JSON.stringify('development'),
    }),
  ),
})

const prodUmdConfig = Object.assign({}, umdConfig, {
  output: Object.assign({}, umdConfig.output, {
    file: 'dist/fraql.min.js',
  }),
  plugins: umdConfig.plugins.concat([
    replace({
      'process.env.NODE_ENV': JSON.stringify('production'),
    }),
    uglify({ sourceMap: true }),
    visualizer({ filename: './bundle-stats.html' }),
  ]),
})

const esConfig = Object.assign({}, configBase, {
  output: [
    {
      file: 'dist/fraql.es.js',
      format: 'es',
      sourcemap: true,
      globals,
    },
    {
      file: 'dist/fraql.cjs.js',
      format: 'cjs',
      exports: 'named',
      sourcemap: true,
      globals,
    },
  ],
})

const serverConfig = Object.assign({}, configBase, {
  input: 'src/server.js',
  output: [
    {
      file: 'dist/fraql.server.cjs.js',
      format: 'cjs',
      exports: 'named',
      sourcemap: true,
    },
  ],
})

const mockConfig = Object.assign({}, configBase, {
  input: 'src/mock.js',
  output: [
    {
      file: 'dist/fraql.mock.cjs.js',
      format: 'cjs',
      exports: 'named',
      sourcemap: true,
      globals,
    },
  ],
})

export default [devUmdConfig, prodUmdConfig, esConfig, serverConfig, mockConfig]
