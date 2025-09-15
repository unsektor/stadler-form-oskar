const gulp = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const sourcemaps = require('gulp-sourcemaps');
const clean = require('gulp-clean');

const webpackStream = require('webpack-stream');
const webpackConfig = require('./webpack.config.js')

function cleanDist() {
    return gulp.src('public/assets', {read: false, allowEmpty: true})
        .pipe(clean());
}

// const typescript = require('gulp-typescript');
// const tsProject = typescript.createProject('tsconfig.json');
// function compileTS() {
//     return gulp.src('frontend_src/**/*.ts')
//         .pipe(sourcemaps.init())
//         .pipe(tsProject())
//         .pipe(sourcemaps.write('.'))
//         .pipe(gulp.dest('public/assets'));
// }

function compileTS() {
    return gulp.src('frontend_src/**/*.ts')
        .pipe(webpackStream(webpackConfig))
        .pipe(gulp.dest('public/assets'));
}

function compileSCSS() {
    return gulp.src('frontend_src/**/*.scss')
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('public/assets'));
}

function copyAssets() {
    return gulp.src(['frontend_src/**/*', '!frontend_src/**/*.ts', '!frontend_src/**/*.*css'])
        .pipe(gulp.dest('public/assets'));
}

function watchFiles() {
    gulp.watch('frontend_src/**/*.ts', compileTS);
    gulp.watch('frontend_src/**/*.scss', compileSCSS);
    gulp.watch(['frontend_src/**/*', '!frontend_src/**/*.ts', '!frontend_src/**/*.scss'], copyAssets);
}

const build = gulp.series(cleanDist, gulp.parallel(compileTS, compileSCSS, copyAssets));
const watch = gulp.series(build, watchFiles);

exports.clean = cleanDist;
exports.build = build;
exports.watch = watch;
exports.default = build;
