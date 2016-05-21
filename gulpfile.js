var gulp = require('gulp');
var minify = require('gulp-minify');
var browserSync = require('browser-sync');
var reload = browserSync.reload;

//Muevo dependencias JS a carpeta vendor de distribucion
gulp.task('move-dependencies', function() {
	gulp.src(['bower_components/jquery/dist/*.min.js']).pipe(gulp.dest('demo/js/vendor'));
	gulp.src(['bower_components/animate.css/*.min.css']).pipe(gulp.dest('demo/css/vendor'));
});

gulp.task('minify', function() {
  gulp.src('src/*.js')
      .pipe(minify({
          ext:{
              min:'.min.js'
          }
      })).pipe(gulp.dest('dist'));
});

// Ve cambios en archivos y recarga
gulp.task('demo', ['minify','move-dependencies'], function() {
	browserSync({
		port: 5000,
		notify: false,
		logPrefix: 'jquery-repeter',
		server: {
			baseDir: ['src', 'demo']
		}
    });

	gulp.watch(['demo/**/*.html'], reload);
	gulp.watch(['demo/images/**/*'], reload);
	gulp.watch(['src/*.js'], reload);
});

gulp.task('default', ['minify']);
