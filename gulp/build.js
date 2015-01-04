'use strict';

var gulp = require('gulp');

var $ = require('gulp-load-plugins')();

gulp.task('styles-components', function () {

    return gulp.src('app/styles/components/components.scss')
        .pipe($.rubySass({ style: 'expanded' }))
        .pipe($.autoprefixer('last 1 version'))
        .pipe(gulp.dest('.tmp/styles'))
        .pipe($.size());
});

gulp.task('styles', ['styles-components'], function () {

    return gulp.src('app/styles/main.scss')
        .pipe($.rubySass({ style: 'expanded' }))
        .pipe($.autoprefixer('last 1 version'))
        .pipe(gulp.dest('.tmp/styles'))
        .pipe($.size());
});

gulp.task('scripts', function () {
    return gulp.src('app/scripts/**/*.js')
        .pipe($.jshint())
        .pipe($.jshint.reporter($.jshintStylish))
        .pipe($.size());
});

gulp.task('copy-docs', function () {
  return gulp.src('docs/**/*')
      .pipe(gulp.dest('dist/'))
      .pipe($.size());
});

gulp.task('partials', function () {
  return gulp.src('app/partials/**/*.html')
      /*.pipe($.minifyHtml({
        empty: true,
        spare: true,
        quotes: true
      }))*/
      .pipe($.ngHtml2js({
        moduleName: "vissensePlayground",
        prefix: "partials/"
      }))
      .pipe(gulp.dest(".tmp/partials"))
      .pipe($.size());
});

gulp.task('html', ['styles', 'scripts', 'partials'], function () {
    var jsFilter = $.filter('**/*.js');
    var cssFilter = $.filter('**/*.css');

    return gulp.src('app/*.html')
        .pipe($.inject(gulp.src('.tmp/partials/**/*.js'), {
          read: false,
          starttag: '<!-- inject:partials -->',
          addRootSlash: false,
          ignorePath: '.tmp'
        }))
        .pipe($.useref.assets())
        .pipe($.rev())
        .pipe(jsFilter)
        .pipe($.ngmin())
        //.pipe($.uglify())
        .pipe(jsFilter.restore())
        .pipe(cssFilter)
        .pipe($.csso())
        .pipe(cssFilter.restore())
        .pipe($.useref.restore())
        .pipe($.useref())
        .pipe($.revReplace())
        .pipe(gulp.dest('dist/app'))
        .pipe($.size());
});

gulp.task('images', function () {
    return gulp.src('app/images/**/*')
        .pipe($.cache($.imagemin({
            optimizationLevel: 3,
            progressive: true,
            interlaced: true
        })))
        .pipe(gulp.dest('dist/app/images'))
        .pipe($.size());
});

gulp.task('bower-fonts', function () {
    return $.bowerFiles()
        .pipe($.filter('**/*.{eot,svg,ttf,woff}'))
        .pipe($.flatten())
        .pipe(gulp.dest('dist/app/fonts'))
        .pipe($.size());
});

gulp.task('fonts', ['bower-fonts'], function () {
  return gulp.src(['app/fonts/**'])
    .pipe(gulp.dest('dist/app/fonts'))
    .pipe($.size({title: 'fonts'}));
});

gulp.task('clean', function () {
    return gulp.src(['.tmp', 'dist'], { read: false }).pipe($.clean());
});

gulp.task('build', ['html', 'partials', 'images', 'fonts', 'copy-docs']);
