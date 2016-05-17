var gulp = require('gulp'),
    source = require('vinyl-source-stream'),
    rename = require('gulp-rename'),
    browserify = require('browserify'),
    watchify = require('watchify'),
    glob = require('glob'),
    es = require('event-stream'),
    reactify = require('reactify');

gulp.task('default', ['js']);

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
          .pipe(gulp.dest('./bundles'));
      }

      b.on('update', bundle);
      return bundle();
    });
    es.merge(tasks).on('end', done);
  });
});

