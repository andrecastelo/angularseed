'use strict';

const gulp = require('gulp');
const sass = require('gulp-sass');
const plumber = require('gulp-plumber');
const browserSync = require('browser-sync').create();
const karmaServer = require('karma').Server;
const del = require('del');

let onError = function(error) {
    console.log(error.toString());
    this.emit('end');
};

const paths = {
    tmp : './tmp',
    dist : './public_html',
    src : './app',
    bower_components : './bower_components'
};

gulp.task('clean:tmp', function() { del([ paths.tmp ]); });
gulp.task('clean:dist', function() { del([ paths.dist ]); });

gulp.task('sass', function() {
    return gulp.src('./app/scss/**/*.scss')
        .pipe(plumber({ errorHandler: onError }))
        .pipe(sass({ outputStyle: 'expanded' }))
        .pipe(gulp.dest(paths.tmp + '/css'))
        .pipe(browserSync.stream());
})

gulp.task('test', function(done) {
    new karmaServer({
        configFile : __dirname + '/karma.conf.js',
        singleRun  : true
    }, done).start();
});

gulp.task('tdd', function(done) {
   new karmaServer({
       configFile : __dirname + '/karma.conf.js'
   }, done).start();
});

function browserSyncInit(baseDir, files) {
    browserSync.instance = browserSync.init(files, {
        startPath: '/', server: { baseDir: baseDir }
    });
}


gulp.task('watch', [ 'clean:tmp', 'sass' ], function() {
    browserSyncInit([ paths.tmp, paths.src ], [
        paths.tmp + '/**/*.css',
        paths.tmp + '/**/*.js',
        paths.tmp + '/**/*.html'
    ]);

    gulp.watch('app/scss/*.scss', [ 'sass' ]);
    gulp.watch('app/scss/sections/*.scss', [ 'sass' ]);
    gulp.watch('app/scss/components/*.scss', [ 'sass' ]);
    gulp.watch('app/**/*.html').on('change', browserSync.reload);
    gulp.watch('app/scripts/*.js').on('change', browserSync.reload);

    // gulp.start('tdd');
});

gulp.task('build', [ 'clean:tmp', 'clean:dist', 'sass' ], function() {
    let sourcePaths = [
        paths.src + '/scripts/**/*.js',
        paths.src + '/bower_components/**/*.*',
        paths.src + '/fonts/**/*.*',
        paths.src + '/**/*.html',
        paths.src + '/images/**/*.*',
        paths.src + '/css/**/*.css',
    ];

    gulp.src(paths.tmp + '/**/*.*').pipe(gulp.dest(paths.dist));
    gulp.src(sourcePaths, { base: 'app' }).pipe(gulp.dest(paths.dist));
});
