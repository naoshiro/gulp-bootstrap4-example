// module
// ---------------------------------------------
const gulp = require('gulp');
const browser = require('browser-sync');
const jade = require('gulp-jade');
const sass = require('gulp-sass')
const autoprefixer = require('gulp-autoprefixer');
const changed = require('gulp-changed')
const del = require('del')

// Path
// ---------------------------------------------
const path = {
  dist: './dist',
  src: './src'
}

// Copy
// ---------------------------------------------
gulp.task("copy", function() {
  gulp.src(path.src + "/**/*.+(jpg|jpeg|png|gif|svg)")
    .pipe(changed(path.dist))
    .pipe(gulp.dest(path.dist))
});

// Sass
// ---------------------------------------------
gulp.task('sass', () => {
  gulp.src(path.src + '/**/*.scss')
    .pipe(sass({
      includePaths: ['./node_modules/bootstrap/scss'],
      outputStyle: 'compressed'
    }).on('error', sass.logError))
    .pipe(autoprefixer({
      browsers: ['last 2 versions', 'ie 9', 'Android >= 3'],
      cascade: false
    }))
    .pipe(gulp.dest(path.dist))
});

// Jade
// ---------------------------------------------
gulp.task('jade', () => {
  gulp.src(path.src + '/**/!(_)*.jade')
    .pipe(jade({
      pretty: true
    }))
    .pipe(gulp.dest(path.dist))
});

// browsersync
// ---------------------------------------------
gulp.task('browsersync', () => {
  browser.init({
    server: {
      baseDir: path.dist
    }
  });
});

// Clean
// ---------------------------------------------
gulp.task("clean", function() {
  del([path.dist])
});

// task
// ---------------------------------------------
gulp.task('build', ['jade', 'sass', 'copy'])

gulp.task('dev', ['browsersync'], () => {
  gulp.watch(path.src + '/**/*.jade', ['jade'])
  gulp.watch(path.src + '/**/*.scss', ['sass'])

  var timer;
  gulp.watch(path.dist + '/**/*', () => {
    clearTimeout(timer);
    timer = setTimeout(browser.reload, 200);
  });
});
