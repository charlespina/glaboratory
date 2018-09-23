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
        use: "file-loader?name=[name].[ext]",
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
        use: "file-loader",
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
    path: __dirname + "/public"
  },
  devtool: 'inline-source-map',
  devServer: {
    // publicPath: 
    contentBase: path.join(__dirname, "public"),
  },
};
