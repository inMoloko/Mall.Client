let gulp = require("gulp");
let wiredep = require("wiredep").stream;
let inject = require('gulp-inject');
let browserSync = require('browser-sync').create();
let runSequence = require('run-sequence');
let eslint = require('gulp-eslint');
let useref = require('gulp-useref');
let minifyCss = require('gulp-minify-css');
let concat = require('gulp-concat');
let mainBowerFiles = require('main-bower-files');
let gulpFilter = require('gulp-filter');
let uglify = require('gulp-uglify');
let less = require('gulp-less');
let sourcemaps = require('gulp-sourcemaps');
let path = require('path');

gulp.task('bower', function () {
    return gulp.src('./index.html')
        .pipe(wiredep({directory: "./bower_components"}))
        .pipe(gulp.dest('./'));
});
function log(error) {
    console.log([
        '',
        "----------ERROR MESSAGE START----------",
        ("[" + error.name + " in " + error.plugin + "]"),
        error.message,
        "----------ERROR MESSAGE END----------",
        ''
    ].join('\n'));
    this.end();
}
//�������� �������
gulp.task('inject', function () {
    var sources = gulp.src(['./Scripts/**/*.{js,css}', './blocks/**/*.{js,css}', './Content/**/*.{js,css}', './bower_components/leaflet.AnimatedMarker/src/AnimatedMarker.js'], {read: false});
    return gulp.src('./index.html')
        .pipe(inject(sources, {relative: true}))
        .pipe(gulp.dest('./'));
});
gulp.task('bower-build', function () {
    var jsFilter = gulpFilter('**/*.js', {restore: true});  //отбираем только  javascript файлы
    var cssFilter = gulpFilter('**/*.css');  //отбираем только css файлы
    return gulp.src(mainBowerFiles())
    // собираем js файлы , склеиваем и отправляем в нужную папку
        .pipe(jsFilter)
        .pipe(concat('vendor.min.js'))
        .pipe(uglify({outSourceMap: true}))
        .pipe(gulp.dest('dist'))
        .pipe(jsFilter.restore)
        // собраем css файлы, склеиваем и отправляем их под синтаксисом css
        .pipe(cssFilter)
        .pipe(concat('vendor.min.css'))
        //processImport - игонорировать @import
        .pipe(minifyCss({processImport: false}))
        .pipe(gulp.dest('dist'));
});


gulp.task('build', function (callback) {
    runSequence('bower', 'inject',
        callback);
});
gulp.task('lint', function () {
    return gulp.src(['./Scripts/**/*.js', './blocks/**/*.js', './Content/**/*.js', '!./Scripts/**/leaflet.js '])
    // eslint() attaches the lint output to the "eslint" property
    // of the file object so it can be used by other modules.
        .pipe(eslint())
        // eslint.format() outputs the lint results to the console. 
        // Alternatively use eslint.formatEach() (see Docs). 
        .pipe(eslint.format())
        // To have the process exit with an error code (1) on 
        // lint error, return the stream and pipe to failAfterError last. 
        .pipe(eslint.failAfterError());
});
gulp.task('less-serve', function () {
    return gulp.src(['style.less', './blocks/**/*.{less,css}', './Scripts/Keyboard/jsKeyboard.css', './Styles/*.{less,css}'])
        .pipe(sourcemaps.init())
        .pipe(less({
            paths: [path.join(__dirname, 'less', 'includes')]
        }))
        .pipe(concat('client.css'))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('dist'))
        .pipe(browserSync.stream())
        .on('error', log);
});

gulp.task('server',['less-serve'], function () {
    browserSync.init({
        server: {
            baseDir: "./"
        }
    });
    gulp.watch(['style.less', './blocks/**/*.{less,css}', './Scripts/Keyboard/jsKeyboard.css', './Styles/*.{less,css}'], ['less-serve']);
    browserSync.watch(['./Scripts/**/*.{js,css,html}', './blocks/**/*.{js,css,html}']).on('change', browserSync.reload);
});