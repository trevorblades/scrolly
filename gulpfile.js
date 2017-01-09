const babelify = require('babelify');
const browserify = require('browserify');
const browserSync = require('browser-sync').create();
const buffer = require('vinyl-buffer');
const del = require('del');
const envify = require('envify');
const gulp = require('gulp');
const gutil = require('gulp-util');
const historyApiFallback = require('connect-history-api-fallback');
const less = require('gulp-less');
const LessPluginAutoPrefix = require('less-plugin-autoprefix');
const LessPluginCleanCSS = require('less-plugin-clean-css');
const livereactload = require('livereactload');
const path = require('path');
const rename = require('gulp-rename');
const source = require('vinyl-source-stream');
const sourcemaps = require('gulp-sourcemaps');
const uglify = require('gulp-uglify');
const watchify = require('watchify');

const SRC_DIR = path.join(__dirname, 'src');
const BUILD_DIR = path.join(__dirname, 'build');
const DEV_DIR = path.join(BUILD_DIR, 'dev');
const DIST_DIR = path.join(BUILD_DIR, 'dist');
const VIEWER_DIR = path.join(process.env.NODE_ENV === 'production' ? DIST_DIR : DEV_DIR, 'viewer');

const browserifyTransforms = [babelify, envify];

// viewer build tasks

gulp.task('viewer-markup', function() {
  return gulp.src(path.join(SRC_DIR, 'viewer.html'))
    .pipe(rename('index.html'))
    .pipe(gulp.dest(VIEWER_DIR));
});

gulp.task('viewer-scripts', function() {
  return browserify(path.join(SRC_DIR, 'viewer.js'), {transform: browserifyTransforms})
    .bundle()
    .pipe(source('viewer.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(uglify({compress: true}))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(VIEWER_DIR));
});

gulp.task('viewer-styles', function() {
  return gulp.src(SRC_DIR + '/viewer.less')
    .pipe(less({
      relativeUrls: true,
      plugins: [new LessPluginAutoPrefix(), new LessPluginCleanCSS()]
    }))
    .on('error', function(err) {
      gutil.log('LESS compilation failed: ' + err.message);
      process.exit(1);
    })
    .pipe(gulp.dest(VIEWER_DIR));
});

gulp.task('viewer', gulp.parallel([
  'viewer-markup',
  'viewer-scripts',
  'viewer-styles'
]));

// development build tasks

function devMarkup() {
  return gulp.src(path.join(SRC_DIR, 'index.html'))
    .pipe(gulp.dest(DEV_DIR))
    .pipe(browserSync.reload({stream: true}));
}
gulp.task('dev-markup', devMarkup);

const bundlerOptions = Object.assign({}, watchify.args, {
  debug: true,
  transform: browserifyTransforms,
  plugin: ['production', 'viewer'].indexOf(process.env.NODE_ENV) !== -1 ?
      null : livereactload
});
const bundler = watchify(browserify(path.join(SRC_DIR, 'main.js'), bundlerOptions));

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
  const stream = gulp.src(path.join(SRC_DIR, 'main.less'))
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
    middleware: [historyApiFallback()],
    open: false,
    ghostMode: false
  }, done);
});

gulp.task('dev-serve', gulp.series('viewer', 'dev-build', 'dev-browser-sync'));

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
  return browserify(path.join(SRC_DIR, 'main.js'), {transform: browserifyTransforms})
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

gulp.task('dist', gulp.series('dist-clean', 'dist-build', 'viewer'));
