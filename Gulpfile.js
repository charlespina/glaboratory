var gulp = require('gulp');
var gutil = require('gulp-util');

var config = require('./webpack.config');
var webpack = require('webpack');
var WebpackDevServer = require('webpack-dev-server');

gulp.task('webpack:build', function(next) {
  webpack(config, function(err, stats) {
    if (err) throw new gutil.PluginError(err);
    gutil.log('[webpack]', stats.toString({}));
    next();
  });
});

gulp.task('webpack:build-dev', function() {
  config.entry.app.unshift('webpack-dev-server/client?http://localhost:8080', 'webpack/hot/dev-server');
  config.plugins = [ new webpack.HotModuleReplacementPlugin() ]; 

  new WebpackDevServer(webpack(config), {
    contentBase: 'public/',
    hot: true,
  }).listen(8080, function(err) {
    if(err) throw new gutil.PluginError("webpack-dev-server", err);
    gutil.log('[webpack-dev-server]', 'http://localhost:8080/webpack-dev-server/index.html');
  });
});

gulp.task('build', ['webpack:build']);
gulp.task('watch', ['webpack:build-dev']);
gulp.task('default', ['build']);
