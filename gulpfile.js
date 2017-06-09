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
let urlAdjuster = require('gulp-css-url-adjuster');
let babel = require('gulp-babel');
let rimraf = require('gulp-rimraf');
let minifyHTML = require('gulp-minify-html');
let templateCache = require('gulp-angular-templatecache');

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
    var sources = gulp.src(['./node_modules/leaflet/dist/leaflet.js','./Scripts/**/*.{js,css}', '.blocks/**/*.{js,css}', './Content/**/*.{js,css}', './bower_components/leaflet.AnimatedMarker/src/AnimatedMarker.js'], {read: false});
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
gulp.task('build:clean', function () {
    return gulp.src('./dist/', {read: false})
        .pipe(rimraf({force: true}))
        .on('error', log);
});
gulp.task('lint', function () {
    return gulp.src(['./Scripts/**/*.js', '.blocks/**/*.js', './Content/**/*.js', '!./Scripts/**/leaflet.js '])
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
gulp.task('template', function () {
    return gulp.src(['./blocks/**/*.html', './Views/*.html'])
        .pipe(minifyHTML({quotes: true}))
        .pipe(templateCache({root: "blocks", module: "app", filename: "templates.js"}))
        .pipe(gulp.dest('dist'))
        .on('error', log);
});
gulp.task('build:content', function () {
    return gulp.src(['./Content/**/*.*'], {read: true, base: '.'})
        .pipe(gulp.dest('dist'))
        .on('error', log);
});

gulp.task('build:index', function () {
    let sources = gulp.src(['dist/vendor.min.{js,css}','dist/script.js','dist/templates.js','dist/client.css'], {read: false});
    return gulp.src('./index.html')
        .pipe(inject(sources, {relative: true, ignorePath:'dist'}))
        .pipe(gulp.dest('dist'));
});
gulp.task('server:index', function () {
    let sources = gulp.src(['dist/vendor.min.{js,css}','dist/script.js','dist/client.css'], {read: false});
    return gulp.src('./index.html')
        .pipe(inject(sources, {relative: true}))
        .pipe(gulp.dest('./'));
});

gulp.task('prod', function (callback) {
    runSequence('build:clean', ['template', 'js-prod', 'less-prod', 'bower-build', 'build:content'], 'build:index', callback);
});
gulp.task('client', function (callback) {
    runSequence('build:clean', ['template', 'js-client', 'less-prod', 'bower-build', 'build:content'], 'build:index', callback);
});

gulp.task('js-prod', function () {
    return gulp.src(['./Scripts/**/*.js', './blocks/**/*.js', './environmental/production/**/*.js'])
        .pipe(concat('script.js'))
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(uglify({outSourceMap: true}))
        .pipe(gulp.dest('dist'));
});
gulp.task('js-client', function () {
    return gulp.src(['./Scripts/**/*.js', './blocks/**/*.js', './environmental/client/**/*.js'])
        .pipe(concat('script.js'))
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(uglify({outSourceMap: true}))
        .pipe(gulp.dest('dist'));
});
gulp.task('js-serve', function () {
    return gulp.src(['./Scripts/**/*.js', './blocks/**/*.js', './environmental/development/**/*.js'])
        .pipe(sourcemaps.init())
        .pipe(concat('script.js'))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('dist'))
        .pipe(browserSync.stream())
        .on('error', log);
});
gulp.task('less-prod', function () {
    return gulp.src(['style.less', './Scripts/Keyboard/jsKeyboard.css', './Styles/*.{less,css}','./Content/icons/mainicons/style.css','./Scripts/Custom-leaflet/leaflet.less','./blocks/**/*.{less,css}'])
        .pipe(concat('client.less'))
        .pipe(less({
            paths: [path.join(__dirname, 'less', 'includes')]
        }))
        .pipe(gulp.dest('dist'));
});
gulp.task('less-serve', function () {
    //,'./Content/icons/mainicons/style.css'
    return gulp.src(['style.less', './Scripts/Keyboard/jsKeyboard.css', './Styles/*.{less,css}','./Content/icons/mainicons/style.css','./Scripts/Custom-leaflet/leaflet.less','./blocks/**/*.{less,css}'])
        .pipe(sourcemaps.init())
        .pipe(less({
            paths: [path.join(__dirname, 'less', 'includes')]
        }))
        // .pipe(urlAdjuster({
        //     replace: ['fonts/', '../Content/icons/mainicons/fonts/'],
        // }))
        .pipe(concat('client.css'))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('dist'))
        .pipe(browserSync.stream())
        .on('error', log);
});

gulp.task('server',['less-serve','js-serve','server:index'], function () {
    browserSync.init({
        server: {
            baseDir: "./"
        }
    });
    gulp.watch(['./Scripts/**/*.js', './blocks/**/*.js', './environmental/development/**/*.js'], ['js-serve']);
    gulp.watch(['style.less', './blocks/**/*.{less,css}', './Scripts/Keyboard/jsKeyboard.css', './Styles/*.{less,css}'], ['less-serve']);
    browserSync.watch(['./Scripts/**/*.{js,css,html}', '.blocks/**/*.{js,css,html}']).on('change', browserSync.reload);
});