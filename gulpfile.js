/* eslint-env node */
var gulp = require('gulp')
var less = require('gulp-less')
var exec = require('child_process').exec
var sourcemaps = require('gulp-sourcemaps')
var csso = require('gulp-csso')
var rename = require('gulp-rename')
var fs = require('fs')

function run(command) {
  var child = exec(command)
  child.stdout.pipe(process.stdout)
  child.stderr.pipe(process.stderr)
  process.on('exit', function(code) {
    if (child.exit) { child.exit(code) }
  })
  child.on('exit', function(code) {
    process.exit(code)
  })
}

gulp.task('less', function() {
  return gulp.src('public/less/main.less')
    .pipe(sourcemaps.init())
    .pipe(less())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('public/css'))
})

gulp.task('cssmin', function() {
  return gulp.src('public/css/main.css')
    .pipe(csso())
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest('public/css'))
})

gulp.task('watch', function() {
  run('npm run watchify')
  run('npm run watchify-test')
  gulp.watch('public/less/**/*.less', ['less'])
})

gulp.task('dev', ['default'], function() {
  run('npm start')
})

gulp.task('hash', function(done) {
  exec('md5 -q public/js/main.js', function(err, hash) {
    fs.readFile('./package.json', 'utf8', function(err, pkg) {
      var json = JSON.parse(pkg)
      json.hash = hash.trim()
      fs.writeFile('package.json', JSON.stringify(json, null, 2), done)
    })
  })
})

gulp.task('css', ['less', 'cssmin']);

gulp.task('default', ['less', 'watch'])

