var gulp = require('gulp');
var gutil = require('gulp-util');

var webpack = require('webpack');
var gulpWebpack = require('gulp-webpack');
var WebpackDevServer = require('webpack-dev-server');

gulp.task('build', ['webpack:build'], function() {

});

gulp.task('watch', ['webpack:build-dev'], function() {

});


gulp.task('webpack:build', function() {
  return gulp.src('src/**.js')
    .pipe(webpack(require('./webpack.config.js')))
    .pipe(gulp.dest('public/'));
});

gulp.task('webpack:build-dev', function() {
  var config = require('./webpack.config.js');
  config.entry.app.unshift('webpack-dev-server/client?http://localhost:8080', 'webpack/hot/dev-server');
  config.plugins = [ new webpack.HotModuleReplacementPlugin() ]; 

  var compiler = require('webpack');
  new WebpackDevServer(compiler(config), {
    contentBase: 'public/',
    hot: true,
  }).listen(8080, function(err) {
    if(err) throw new gutil.PluginError("webpack-dev-server", err);
    gutil.log('[webpack-dev-server]', 'http://localhost:8080/webpack-dev-server/index.html');
  });
});

gulp.task('default', ['build']);
