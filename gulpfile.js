// ////////////////////////////////////////////////////////////////////////////
// Required modules | Path Location Variables
// ////////////////////////////////////////////////////////////////////////////

var gulp = require( 'gulp' ),
  uglify = require( 'gulp-uglify' ),
  sass = require( 'gulp-sass' ),
  plumber = require( 'gulp-plumber' ),
  autoprefixer = require( 'gulp-autoprefixer' ),
  browserSync = require( 'browser-sync' ),
  reload = browserSync.reload,
  rename = require( 'gulp-rename' ),
  del = require( 'del' );

var jsLoc = 'app/js/**/*.js',
  jsExclude = '!app/js/**/*.min.js',
  scssMainLoc = 'app/scss/main.scss',
  scssFolder = 'app/scss/**/*.scss',
  htmlLoc = 'app/**/*.html',
  baseLoc = './app/';

var cssDest = 'app/css/',
  jsDest = 'app/js';




// ////////////////////////////////////////////////////////////////////////////
// Scripts Tasks
// ////////////////////////////////////////////////////////////////////////////

gulp.task( 'scripts', function() {
  gulp.src( [ jsLoc, jsExclude ] )
    .pipe( plumber() )
    .pipe( rename( { suffix: '.min' } ) )
    .pipe( uglify() )
    .pipe( gulp.dest( jsDest ) )
    .pipe( reload( { stream: true } ) );
} );



/////////////////////////////////////////////////////////////////////////////
// Styles Task
/////////////////////////////////////////////////////////////////////////////
gulp.task( 'sass', function() {
  gulp.src( scssMainLoc )
    .pipe( plumber() )
    .pipe( rename( { suffix: '.min' } ) )
    .pipe( sass( { outputStyle: 'compressed' } ).on( 'error', sass.logError ) )
    .pipe( autoprefixer( 'last 2 versions' ) )
    .pipe( gulp.dest( cssDest ) )
    .pipe( reload( { stream: true } ) );
} );



// ////////////////////////////////////////////////////////////////////////////
// HTML Tasks
// ////////////////////////////////////////////////////////////////////////////

gulp.task( 'html', function() {
  gulp.src( htmlLoc )
    .pipe( reload( { stream: true } ) );
} );



// ////////////////////////////////////////////////////////////////////////////
// Browser-Sync Tasks
// ////////////////////////////////////////////////////////////////////////////

gulp.task( 'browser-sync', function() {
  browserSync( {
    server: {
      baseDir: baseLoc
    }
  } );
} );



/////////////////////////////////////////////////////////////////////////////
// Watch Task
/////////////////////////////////////////////////////////////////////////////

gulp.task( 'watch', function() {
  gulp.watch( jsLoc, [ 'scripts' ] );
  gulp.watch( scssFolder, [ 'sass' ] );
  gulp.watch( htmlLoc, [ 'html' ] );
} );



/////////////////////////////////////////////////////////////////////////////
// Build Tasks
/////////////////////////////////////////////////////////////////////////////

// Delete old dist folder
gulp.task( 'build:cleanfolder', function( cb ) {
  del( [
    'dist/**'
  ], cb() );
} );

// Copy directories
gulp.task( 'build:copy', [ 'build:cleanfolder' ], function() {
  return gulp.src( 'app/**/*/' )
    .pipe( gulp.dest( 'dist/' ) );
} );

// Remove unwanted build files
gulp.task( 'build:remove', [ 'build:copy' ], function( cb ) {
  del( [
    'dist/scss/',
    'dist/js/!(*.min.js)'
  ], cb() );
} );

gulp.task( 'build', [ 'build:copy', 'build:remove' ] );



/////////////////////////////////////////////////////////////////////////////
// Default Task
/////////////////////////////////////////////////////////////////////////////

gulp.task( 'default', [ 'scripts', 'sass', 'html', 'browser-sync', 'watch' ] );



// End File
