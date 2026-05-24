var path = require("path");

module.exports = {
  mode: 'development',
  context: path.resolve(__dirname, "src"),
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: [{ loader: "style-loader" }, { loader: "css-loader" }, { loader: "sass-loader" }],
      },
      {
        test: /\.html$/,
        type: 'asset/resource',
        generator: { filename: '[name][ext]' },
      },
      {
        test: /\.js$/,
        exclude: /node_modules|src\/lib\/three.js/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react'],
          },
        },
      },
      {
        test: /\.(jpg|png|gif|hdr)$/,
        type: 'asset/resource',
      },
      {
        test: /\.(frag|vert|glsl)$/,
        use: [ "raw-loader", "glslify-loader" ],
      }
    ],
  },
  entry: {
    app: [
      "./app.js",
      "./index.html"
    ],
  },
  output: {
    filename: "./js/app.js",
    path: __dirname + "/public",
    publicPath: '/',
  },
  devtool: 'inline-source-map',
  devServer: {
    static: {
      directory: path.join(__dirname, "public"),
    },
    historyApiFallback: true,
  },
};
