var gulp        = require('gulp');
var postcss     = require('gulp-postcss');          // CSS post processor
var autprefixer = require('autoprefixer');          // CSS automatic prefixer
var csscomb     = require('gulp-csscomb');          // CSS beautifyer
var sass        = require('gulp-sass');             // SASS compilator
var unCSS       = require('gulp-uncss');            // Delate unused in HTML files CSS rules
var cleanCSS    = require('gulp-clean-css');        // CSS minificator
var mediaPacker = require('css-mqpacker');          // Packing CSS media requests with same rule 
var browserSync = require('browser-sync').create(); // Page live reload
var plumber     = require('gulp-plumber');          // Don't stoping BrowserSynch task when error in other tasks
var rename      = require('gulp-rename');           // Files renamer
var sourcemap   = require('gulp-sourcemaps');       // Sourcemaps maker  
var htmlMinify  = require('gulp-html-minifier');    // HTML minificator


// SASS compilation
gulp.task('sassToCss', function() {
        var processors = [autprefixer({ grid: true }), mediaPacker({ sort: true })];
        return gulp.src('src/sass/*.scss')
            .pipe(plumber())
                .pipe(sourcemap.init())
                    .pipe(sass())
                    .pipe(postcss(processors))
                    // .pipe(cleanCSS())
                        // {debug: true}, (details) => { 
                        // console.log(`${details.name}: ${details.stats.originalSize}`);
                        // console.log(`${details.name}: ${details.stats.minifiedSize}`);
                    // .pipe(rename({suffix: '.min'}))
                .pipe(sourcemap.write('.'))
            .pipe(plumber.stop())
        .pipe(gulp.dest('dist/css'))
        .pipe(browserSync.stream());
});

// Live reload
gulp.task('server', function() {   
    browserSync.init({
        server: "dist"
    });
    gulp.watch("src/sass/**/*.scss", gulp.series('sassToCss', 'imgTranslation'));
    gulp.watch("src/*.html", gulp.series('html', 'imgTranslation'));
    gulp.watch("src/js/**/*.js", gulp.series('scripts'));
});



// HTML minification
gulp.task('html', function() {
        return gulp.src('src/*.html')
        .pipe(gulp.dest('dist'))
        .pipe(browserSync.stream());
});




// Img translation
gulp.task('imgTranslation', function() {
    return gulp.src('src/img/**/*.*')
    .pipe(gulp.dest('dist/img'));
});



// Scripts transformation
gulp.task('scripts', function() {
    return gulp.src('src/js/*.js')
    .pipe(gulp.dest('dist/js'))
    .pipe(browserSync.stream());
});



// Live reload starting
gulp.task('go', gulp.series('sassToCss', 'scripts', 'html', 'imgTranslation', 'server', ));



// CSS max optimization
gulp.task('cssFinish', function() {
        return gulp.src('dist/css/style.min.css')
        .pipe(plumber())
            .pipe(sourcemap.init())
                .pipe(sass())
                .pipe(postcss(processors))
                .pipe(cleanCSS({debug: true}, (details) => {
                    console.log(`${details.name}: ${details.stats.originalSize}`);
                    console.log(`${details.name}: ${details.stats.minifiedSize}`);
                }))
                .pipe(rename({suffix: '.min'}))
            .pipe(sourcemap.write('.'))
        .pipe(plumber.stop())
        .pipe(unCSS({
            html: ['src/index.html']
        }))
    .pipe(gulp.dest('dist/css'))
    .pipe(browserSync.reload());
});



// CSS beautifying
gulp.task('beautifyCss', function() {
        return gulp.src('src/css/*.scss')
            .pipe(csscomb())
        .pipe(gulp.dest('src/scss'));
});