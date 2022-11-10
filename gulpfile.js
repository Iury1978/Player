import gulp from "gulp";
import cssimport from "gulp-cssimport";
import gcmq from "gulp-group-css-media-queries";
const options = {};
gulp.task("import", function () {
  gulp
    .src("style/index.css")
    .pipe(cssimport())
    .pipe(gcmq())
    .pipe(gulp.dest("css/"));
});
