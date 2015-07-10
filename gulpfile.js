var args = require("yargs").argv;
var gulp = require("gulp");
var child_process = require("child_process");
var path = require("path");
var shell = require("gulp-shell");

var paths = {
    js: [ "./src/**/*" ],
};

gulp.task("default", [ "policies" ]);

gulp.task("watch", function () {
    var watch = require("gulp-watch");
    var scriptTask = args.verify !== false ? "policies" : "scripts";

    gulp.start(scriptTask);

    watch(paths.js, function () {
        gulp.start(scriptTask);
    });
});

gulp.task("watch-karma-unit", function () {
    var watch = require("gulp-watch");

    gulp.start("karma-unit");

    watch(paths.js, function () {
        gulp.start("karma-unit");
    });
});

gulp.task("karma-unit", [ "jshint", "karma-unit-bare" ], function (done) {
    done(); // just a convenience task
});

gulp.task("karma-unit-bare", function () {
    var karma = require("gulp-karma");

    var options = {
        "configFile": "./test/karma.conf.js",
        "action": "run"
    };

    // Files need extra options and so are listed in the conf file instead of src below
    return gulp.src([])
        .pipe(karma(options));
});

gulp.task("policies", [ "karma-unit" ], shell.task([
    "make test-policies"
]));

gulp.task("jshint", function () {
    var jshint = require("gulp-jshint");

    return gulp.src(paths.js)
        .pipe(jshint())
        .pipe(jshint.reporter())
        .pipe(jshint.reporter("fail"));
});
