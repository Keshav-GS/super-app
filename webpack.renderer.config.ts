import type { Configuration } from 'webpack';

import { rules } from './webpack.rules';
import { plugins } from './webpack.plugins';

rules.push({
  test: /\.css$/,
  use: [{ loader: 'style-loader' }, { loader: 'css-loader' }, { loader: 'postcss-loader' }],
});

export const rendererConfig: Configuration = {
  module: {
    rules,
  },
  plugins,
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css'],
  },
};

// import type { Configuration } from 'webpack';

// import { rules } from './webpack.rules';
// import { plugins } from './webpack.plugins';
// import * as path from 'path';
// import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin';

// const isDevelopment = process.env.NODE_ENV !== 'production';
// rules.push({
//   test: /\.css$/,
//   use: [{ loader: 'style-loader' }, { loader: 'css-loader' }, { loader: 'postcss-loader' }],
// });
// rules.push({
//   test: /\.(ts|tsx)$/,
//   exclude: /node_modules/,
//   use: [
//     {
//       loader: require.resolve('babel-loader'),
//       options: {
//         presets: [
//           '@babel/preset-env',
//           '@babel/preset-react',
//           '@babel/preset-typescript',
//         ],
//         plugins: [
//           isDevelopment && require.resolve('react-refresh/babel'),
//         ].filter(Boolean),
//       },
//     },
//   ],
// });
// export const rendererConfig: Configuration = {
//   mode: isDevelopment ? 'development' : 'production',
//   module: {
//     rules,
//   },
//   plugins: [
//     ...plugins,
//     ...(isDevelopment ? [new ReactRefreshWebpackPlugin()] : []),
//   ],
//   resolve: {
//     extensions: ['.js', '.ts', '.jsx', '.tsx', '.css'],
//   },
//   devServer: {
//     static: {
//       directory: path.join(__dirname, 'dist'),
//     },
//     historyApiFallback: true, // needed for React Router + BrowserRouter
//     hot: true,
//     port: 3000,
//   },
//   devtool: isDevelopment ? 'inline-source-map' : false,
// };
