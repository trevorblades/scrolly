var path = require('path');
var babelify = require('babelify');
var browserify = require('browserify');
var browserSync = require('browser-sync').create();
var del = require('del');
var gulp = require('gulp');
var less = require('gulp-less');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
var gutil = require('gulp-util');
var LessPluginAutoPrefix = require('less-plugin-autoprefix');
var LessPluginCleanCSS = require('less-plugin-clean-css');
var livereactload = require('livereactload');
var buffer = require('vinyl-buffer');
var source = require('vinyl-source-stream');
var watchify = require('watchify');

var SRC_DIR = path.join(__dirname, 'src');
var BUILD_DIR = path.join(__dirname, 'build');
var DEV_DIR = path.join(BUILD_DIR, 'dev');
var DIST_DIR = path.join(BUILD_DIR, 'dist');

// development build tasks

function devMarkup() {
  return gulp.src(path.join(SRC_DIR, 'index.html'))
    .pipe(gulp.dest(DEV_DIR))
    .pipe(browserSync.reload({stream: true}));
}
gulp.task('dev-markup', devMarkup);

var bundlerOptions = Object.assign({}, watchify.args, {
  debug: true,
  transform: babelify,
  plugin: livereactload
});
var bundler = watchify(browserify(path.join(SRC_DIR, 'main.js'), bundlerOptions));

function bundle() {
  return bundler.bundle()
    .on('error', gutil.log.bind(gutil, 'Error Bundling'))
    .pipe(source('main.js'))
    .pipe(gulp.dest(DEV_DIR));
}

bundler.on('update', bundle);
bundler.on('log', gutil.log);

gulp.task('dev-scripts', bundle);

function devStyles() {
  var stream = gulp.src(path.join(SRC_DIR, 'main.less'))
    .pipe(sourcemaps.init())
    .pipe(less({
      relativeUrls: true,
      plugins: [new LessPluginAutoPrefix()]
    }))
    .on('error', function(err) {
      gutil.log('LESS compilation failed: ' + err.message);
      browserSync.notify(err.message, 30000);
      stream.end();
    })
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(DEV_DIR))
    .pipe(browserSync.stream());
  return stream;
}
gulp.task('dev-styles', devStyles);

function devAssets() {
  return gulp.src(path.join(SRC_DIR, '**', 'assets', '**'))
    .pipe(gulp.dest(DEV_DIR))
    .pipe(browserSync.stream());
}
gulp.task('dev-assets', devAssets);

gulp.task('dev-build', gulp.parallel([
  'dev-markup',
  'dev-scripts',
  'dev-styles',
  'dev-assets'
]));

gulp.task('dev-browser-sync', function(done) {
  return browserSync.init({
    server: {
      baseDir: DEV_DIR
    },
    open: false,
    ghostMode: false
  }, done);
});

gulp.task('dev-serve', gulp.series('dev-build', 'dev-browser-sync'));

gulp.task('dev-watch', function(done) {
  gulp.watch(path.join(SRC_DIR, 'index.html'), devMarkup);
  gulp.watch(path.join(SRC_DIR, '**', '*.less'), devStyles);
  gulp.watch(path.join(SRC_DIR, '**', 'assets', '**'), devAssets);
  done();
});

gulp.task('dev', gulp.parallel('dev-serve', 'dev-watch'));

// distribution build tasks

gulp.task('dist-clean', function() {
  return del(path.join(DIST_DIR, '**', '*'));
});

gulp.task('dist-markup', function() {
  return gulp.src(path.join(SRC_DIR, 'index.html'))
    .pipe(gulp.dest(DIST_DIR));
});

gulp.task('dist-scripts', function() {
  return browserify(path.join(SRC_DIR, 'main.js'))
    .bundle()
    .pipe(source('main.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(uglify({compress: true}))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(DIST_DIR));
});

gulp.task('dist-styles', function() {
  return gulp.src(SRC_DIR + '/main.less')
    .pipe(less({
      relativeUrls: true,
      plugins: [new LessPluginAutoPrefix(), new LessPluginCleanCSS()]
    }))
    .on('error', function(err) {
      gutil.log('LESS compilation failed: ' + err.message);
      process.exit(1);
    })
    .pipe(gulp.dest(DIST_DIR));
});

gulp.task('dist-assets', function() {
  return gulp.src(path.join(SRC_DIR, '**', 'assets', '**'))
    .pipe(gulp.dest(DIST_DIR));
});

gulp.task('dist-build', gulp.parallel([
  'dist-markup',
  'dist-scripts',
  'dist-styles',
  'dist-assets'
]));

gulp.task('dist', gulp.series('dist-clean', 'dist-build'));
