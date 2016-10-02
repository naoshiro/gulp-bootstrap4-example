// module
// ---------------------------------------------
const gulp = require('gulp');
const browser = require('browser-sync');
const jade = require('gulp-jade');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const changed = require('gulp-changed');
const del = require('del');
const plumber = require('gulp-plumber');
const browserify = require('browserify');
const xtend = require('xtend');
const watchify = require('watchify');
const source = require('vinyl-source-stream');
const babelify = require('babelify');
const uglify = require('gulp-uglify');


// Path
// ---------------------------------------------
const path = {
  dist: './dist',
  src: './src'
}

// Copy
// ---------------------------------------------
gulp.task('copy', ()=> {
  gulp.src(path.src + '/**/*.+(jpg|jpeg|png|gif|svg|ico)')
    .pipe(changed(path.dist))
    .pipe(gulp.dest(path.dist));
});

// Sass
// ---------------------------------------------
gulp.task('sass', ()=> {
  gulp.src(path.src + '/**/*.scss')
    .pipe(sass({
      includePaths: ['./node_modules/bootstrap/scss'],
      outputStyle: 'compressed'
    }).on('error', sass.logError))
    .pipe(autoprefixer({
      browsers: ['last 2 versions', 'ie 9', 'Android >= 3'],
      cascade: false
    }))
    .pipe(gulp.dest(path.dist));
});

// Jade
// ---------------------------------------------
gulp.task('jade', ()=> {
  gulp.src(path.src + '/**/!(_)*.jade')
    .pipe(plumber())
    .pipe(jade({
      pretty: true
    }))
    .pipe(gulp.dest(path.dist));
});

// browserify
// ---------------------------------------------
var watching = false;
gulp.task('enable-watch-mode', ()=> watching = true);

gulp.task('watchjs', ['enable-watch-mode'], ()=> {
  gulp.start('js');
});

gulp.task('js', ()=> {
  var bundler = browserify({
    entries: [path.src + '/assets/js/script.js'],
    extensions: ['.js'],
    transform: ['babelify'],
    plugin: ['licensify'],
    debug: true
  });

  if (watching) {
    bundler = watchify(bundler);
    bundler.on('update', ()=> {
      rebundle();
    });
  }
  rebundle();

  function rebundle() {
    bundler
    .bundle()
    .on('error', (err)=> {
      console.log('Error: ' + err.message);
    })
    .pipe(source('script.js'))
    .pipe(gulp.dest(path.dist + '/assets/js/'));
  }
});

// browsersync
// ---------------------------------------------
gulp.task('browsersync', ()=> {
  browser.init({
    server: {
      baseDir: path.dist
    }
  });
});

// Clean
// ---------------------------------------------
gulp.task('clean', ()=> {
  del([path.dist])
});

// Compress
// ---------------------------------------------
gulp.task('uglify', () => {
  gulp.src(path.dist + '/assets/js/script.js')
    .pipe(uglify({
      preserveComments: 'license'
    }))
    .pipe(gulp.dest(path.dist + '/assets/js/'));
});

// task
// ---------------------------------------------
gulp.task('build', ['jade', 'sass', 'js', 'copy']);

gulp.task('dev', ['watchjs', 'browsersync'], ()=> {
  gulp.watch(path.src + '/**/*.jade', ['jade']);
  gulp.watch(path.src + '/**/*.scss', ['sass']);

  var timer;
  gulp.watch(path.dist + '/**/*', ()=> {
    clearTimeout(timer);
    timer = setTimeout(browser.reload, 400);
  });
});
