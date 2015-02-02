'use strict';

var gulp = require('gulp');

var $ = require('gulp-load-plugins')();

gulp.task('connect:src', function () {
  var connect = require('connect');
  var serveStatic = require('serve-static');
  var serveIndex = require('serve-index');
  var app = connect()
    .use(require('connect-livereload')({ port: 35729 }))
    .use(serveStatic('app'))
    .use(serveStatic('.tmp'))
    .use(serveIndex('app'))
    .use('/vissense', function (req, res, next) {

       res.writeHead(201, "OK", {'Content-Type': 'text/plain'});
       res.write("Not implemented yet.");
       res.end();
     });

  gulp.server = require('http').createServer(app)
    .listen(9000)
    .on('listening', function () {
      console.log('Started connect web server on http://localhost:9000');
    });
});

gulp.task('connect:dist', function () {
  var connect = require('connect');
  var serveStatic = require('serve-static');
  var app = connect()
    .use(serveStatic('dist'));

  gulp.server = require('http').createServer(app)
    .listen(9000)
    .on('listening', function () {
      console.log('Started connect web server for dist files on http://localhost:9000');
    });
});

gulp.task('serve', ['connect:src', 'styles'], function () {
  require('opn')('http://localhost:9000');
});

gulp.task('serve:dist', ['connect:dist'], function () {
    require('opn')('http://localhost:9000');
});
