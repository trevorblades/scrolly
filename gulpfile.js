const babelify = require('babelify');
const browserify = require('browserify');
const browserSync = require('browser-sync').create();
const buffer = require('vinyl-buffer');
const del = require('del');
const envify = require('envify');
const eventStream = require('event-stream');
const gulp = require('gulp');
const gutil = require('gulp-util');
const historyApiFallback = require('connect-history-api-fallback');
const less = require('gulp-less');
const LessPluginAutoPrefix = require('less-plugin-autoprefix');
const LessPluginCleanCSS = require('less-plugin-clean-css');
const livereactload = require('livereactload');
const path = require('path');
const source = require('vinyl-source-stream');
const sourcemaps = require('gulp-sourcemaps');
const uglify = require('gulp-uglify');
const watchify = require('watchify');

const SRC_DIR = path.join(__dirname, 'src');
const BUILD_DIR = path.join(__dirname, 'build');
const DEV_DIR = path.join(BUILD_DIR, 'dev');
const DIST_DIR = path.join(BUILD_DIR, 'dist');

const browserifyTransforms = [babelify, envify];
const scripts = [
  path.join(SRC_DIR, 'main.js'),
  path.join(SRC_DIR, 'viewer', 'main.js')
];

// development build tasks

function devMarkup() {
  return gulp.src(path.join(SRC_DIR, 'index.html'))
    .pipe(gulp.dest(DEV_DIR))
    .pipe(browserSync.reload({stream: true}));
}
gulp.task('dev-markup', devMarkup);

function bundle(bundler, file) {
  return function() {
    gutil.log('Building', file);
    return bundler.bundle()
      .on('error', err => {
        gutil.log('Error Bundling:', err.stack);
      })
      .pipe(source(file))
      .pipe(gulp.dest(DEV_DIR));
  };
}

gulp.task('dev-scripts', function() {
  const bundlerOptions = Object.assign({}, watchify.args, {
    debug: true,
    transform: browserifyTransforms,
    plugin: livereactload
  });
  const streams = scripts.map(function(script) {
    const bundler = watchify(browserify(script, bundlerOptions));
    const watcher = bundle(bundler, script.replace(SRC_DIR + '/', ''));
    bundler.on('update', watcher);
    bundler.on('log', gutil.log);
    return watcher();
  });
  return eventStream.merge(streams);
});

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
  var streams = scripts.map(function(script) {
    return browserify(script, {transform: browserifyTransforms})
      .bundle()
      .pipe(source(script.replace(SRC_DIR + '/', '')))
      .pipe(buffer())
      .pipe(uglify({compress: true}))
      .pipe(gulp.dest(DIST_DIR));
  });
  return eventStream.merge(streams);
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
