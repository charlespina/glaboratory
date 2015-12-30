module.exports = {
  context: __dirname + "/src",
  module: {
    loaders: [
      {
        test: /\.scss$/,
        loaders: ["style", "css", "sass"],
      },
      {
        test: /\.html$/,
        loader: "file?name=[name].[ext]",
      },
      {
        test: /\.js$/,
        exclude: /node_modules|src\/lib\/three.js/,
        loaders: ['babel-loader?presets[]=react,presets[]=es2015'],
      },
      {
        test: /\.(frag|vert)$/,
        loader: "raw"
      }
    ],
    sassLoader: {
      indentedSyntax: true
    },
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
};