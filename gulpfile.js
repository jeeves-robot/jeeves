var gulp = require('gulp'),
    source = require('vinyl-source-stream'),
    rename = require('gulp-rename'),
    browserify = require('browserify'),
    watchify = require('watchify'),
    glob = require('glob'),
    es = require('event-stream'),
    reactify = require('reactify'),
    gutil = require('gulp-util'),
    jshint = require('gulp-jshint'),
    react = require('gulp-react'),
    stylish = require('jshint-stylish'),
    concatCss = require('gulp-concat-css'),
    flatten = require('gulp-flatten');

var BOWER_PATH = './bower_components/**/*.css';
var HTML_PATH = './src/pages/*.html';
var CSS_PATH = './src/styles/*.css';
var JS_PATH = './src/scripts/*.js';
var LIBS_PATH = './libs/*.js';
var FAVICON = './favicon.ico';
var MOVE_PATHS = [HTML_PATH, CSS_PATH, LIBS_PATH, FAVICON]

function show_error_message(err) {
  gutil.log(gutil.colors.red(err.message));
  this.emit('end');
}

gulp.task('default', ['move', 'js', 'lint', 'bower']);

gulp.watch(JS_PATH, ['lint']);

gulp.task('lint', function(done) {
  return gulp.src(JS_PATH)
              .pipe(react())
              .on('error', show_error_message)
              .pipe(jshint())
              .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('js', function(done) {
  glob(JS_PATH, function(err, files) {
    if (err) done(err);

    var tasks = files.map(function(entry) {
      var b = browserify({
                  entries: [entry],
                  debug: true,
                  cache: {},
                  packageCache: {}
                })
              .transform(reactify)
              .plugin(watchify);

      var bundle = function() {
        gutil.log("Bundling " + entry)
        return b.bundle()
          .on('error', show_error_message)
          .pipe(source(entry))
          .pipe(rename({
            extname: '.bundle.js'
            }))
          .pipe(flatten({ includeParents: -1 }))
          .pipe(gulp.dest('./public'));
      }

      b.on('update', bundle);
      b.on('error', gutil.log);
      return bundle();
    });
    es.merge(tasks).on('end', done);
  });
});

gulp.task('bower', function() {
  return gulp.src(BOWER_PATH)
             .pipe(concatCss('bundle.css'))
             .pipe(gulp.dest('./public'));
});


gulp.task('move', function() {
  return gulp.src(MOVE_PATHS)
              .pipe(gulp.dest('./public'));
});

gulp.watch(MOVE_PATHS, ['move'])

