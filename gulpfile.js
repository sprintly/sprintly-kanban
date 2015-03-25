var gulp = require('gulp');
var less = require('gulp-less');
var exec = require('child_process').exec;
var sourcemaps = require('gulp-sourcemaps');
var csso = require('gulp-csso');
var rename = require('gulp-rename');

gulp.task('less', function() {
  gulp.src('public/less/main.less')
    .pipe(sourcemaps.init())
    .pipe(less())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('public/css'));
});

gulp.task('cssmin', function() {
  gulp.src('public/css/main.css')
    .pipe(csso())
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest('public/css'));
});

gulp.task('watch', function() {
  var child = exec('npm run watchify');
  child.stdout.pipe(process.stdout);
  child.stderr.pipe(process.stderr);
  process.on('exit', function(code) {
    if (child.exit) { child.exit(code); }
  });
  child.on('exit', function(code) {
    process.exit(code);
  });

  gulp.watch('public/less/**/*.less', ['less']);
});

gulp.task('css', ['less', 'cssmin']);

gulp.task('default', ['less', 'watch']);

