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
    react = require('gulp-react');

gulp.task('default', ['js']);

//gulp.watch('./scripts/*.js', ['lint']);

gulp.task('lint', function(done) {
  return gulp.src('./scripts/*.js')
              .pipe(react())
              .pipe(jshint())
              .pipe(jshint.reporter('default'));
});

gulp.task('js', function(done) {
  glob('./scripts/*.js', function(err, files) {
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
        return b.bundle()
          .pipe(source(entry))
          .pipe(rename({
            extname: '.bundle.js'
            }))
          .on('error', function(err) {
            gutil.log(err.message)
          })
          .pipe(gulp.dest('./bundles'));
      }

      b.on('update', bundle);
      b.on('error', gutil.log);
      return bundle();
    });
    es.merge(tasks).on('end', done);
  });
});

