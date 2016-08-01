/**
 * @company Xenyo Limited
 * @project Gulp for projects
 * @author  Jimmy LAU <jimmylau@xenyo.com>
 * @version 1.1.0
 * @since   2016-06-23
 * 
 * This Gulp control for project: Dimon 
 * 
 */

// Load plugins
/* NodeJS */
var fs = require('fs');
/* Gulp */
var gulp = require('gulp'),
    ps = require('gulp-load-plugins')({
        //DEBUG: true,
        pattern: ['gulp-*', 'gulp.*'],
        scope: ['dependencies', 'devDependencies', 'peerDependencies'],
        replaceString: /^gulp(-|\.)/, 
        camelize: true,
        lazy: true 
    });
/* BrowserSync */
var bs = require('browser-sync').create();

// Global variables
var DEBUG       = false;
var PRODUCTION  = false;
var SYNC        = true;
var GULP_PATH   = __dirname.replace(/\\/g, '/') + '/'; 
var html_src    = GULP_PATH + '../../web/themes/custom/xenyo/templates/';
var css_src     = GULP_PATH + '../../web/themes/custom/xenyo/less/',
    css_dest    = GULP_PATH + '../../web/themes/custom/xenyo/css/';
var js_src      = GULP_PATH + '../../web/themes/custom/xenyo/js/',
    js_dest     = GULP_PATH + '../../web/themes/custom/xenyo/js/min/';
var proxy       = 'http://localhost/Source/dimon/web/';

// Register for Gulp Tasks
/* Task for styles */
gulp.task('build-css', function () {
    //return gulp.src(css_src + '**/*.less')
    return gulp.src(css_src + 'style.less')
        .pipe(ps.plumber({
           errorHandler: function (err) {
                if (true) console.log(err);
                this.emit('end');
            }
        }))
        .pipe(ps.changed(css_dest))
        .pipe(!PRODUCTION ? ps.sourcemaps.init() : ps.util.noop())
            .pipe(ps.less())
            .pipe(ps.autoprefixer())
            .pipe(PRODUCTION ? ps.cleanCss() : ps.util.noop())
        .pipe(!PRODUCTION ? ps.sourcemaps.write() : ps.util.noop())
        .pipe(ps.size())
        .pipe(gulp.dest(css_dest))
        .pipe(SYNC ? bs.reload({stream:true, once: true}) : ps.util.noop())
        .pipe(ps.notify("Build-CSS Finish"));
});
/* Task for scripts */
gulp.task('build-js', function () {
    return gulp.src([js_src + '**/*.js', '!' + js_src + 'min/**', '!' + js_src + 'plugins/**'])
        .pipe(ps.plumber({
            errorHandler: function (err) {
                if (LOG) console.log(err);
                this.emit('end');
            }
        }))
        .pipe(ps.changed(js_dest))
        .pipe(ps.jshint())
        .pipe(ps.jshint.reporter('default'))
        .pipe(!PRODUCTION ? ps.sourcemaps.init() : ps.util.noop())
            .pipe(PRODUCTION ? ps.uglify() : ps.util.noop())
        .pipe(!PRODUCTION ? ps.sourcemaps.write() : ps.util.noop())
        .pipe(ps.rename({suffix: ".min"}))
        .pipe(ps.size())
        .pipe(gulp.dest(js_dest))
        .pipe(SYNC ? bs.reload({stream:true, once: true}) : ps.util.noop())
        .pipe(ps.notify("Build-JS Finish"));
});
/* Task for browserSync */
gulp.task('browser-sync', function() {
    bs.init({
        //injectChanges: true,
        proxy: {
            target: proxy,
            ws: true
        }
    });
});
/* Task for nothing */
gulp.task('refresh-template', function() {
    return gulp.src(html_src + '**/*.twig')
        .pipe(ps.util.noop())
        .pipe(gulp.dest(html_src))
        .pipe(SYNC ? bs.reload({stream:true, once: true}) : ps.util.noop());
        //.pipe(ps.notify("Refresh Webpage"));
});
/* Task for gulp watch */
gulp.task('watch-css', function() {
    return gulp.watch([css_src + '**/*.less'], ['build-css'], bs.reload);
});
gulp.task('watch-js', function() {
    return gulp.watch([js_src + '**/*.js', '!' + js_src + 'min/**', '!' + js_src + 'plugins/**'], ['build-js'], bs.reload);
});
gulp.task('watch-template', function() {
    return gulp.watch([html_src + '**', html_src + '../*.theme'], ['refresh-template'], bs.reload);
});

// Set default gulp task
if (DEBUG) {
    gulp.task('default', ['build-css', 'build-js']);
} else {
    gulp.task('default', ['browser-sync', 'build-css', 'build-js', 'watch-css', 'watch-js', 'watch-template']);
}

