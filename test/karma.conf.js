module.exports = function(config) {
  config.set({

    basePath: "./../",

    files: [
      "bower_components/angular/angular.js",
      "bower_components/angular-mocks/angular-mocks.js",
      "bower_components/karma-test-helpers/angular.js",
      "node_modules/phantomjs-polyfill/bind-polyfill.js",
      "bower_components/angular-functional-helpers/src/functional-helper.js",
      "src/**/*.js"
    ],

    autoWatch: true,

    exclude: [
    ],

    frameworks: [ "jasmine" ],

    reporters: [ "progress", "coverage" ],

    browsers: [ "PhantomJS" ],

    plugins: [
      "karma-phantomjs-launcher",
      "karma-jasmine",
      "karma-coverage"
    ],

    preprocessors: {
      "src/**/!(*_test).js": [ "coverage" ]
    },

    coverageReporter: {
        dir: "test/karma-coverage/",
        reporters: [
            { type: "text-summary", subdir: "." },
            { type: "text-summary", subdir: ".", file: "coverage-summary.txt" },
            { type: "html", subdir: "." },
            { type: "lcov", subdir: "lcov" },
            { type: "cobertura", subdir: "cobertura" }
        ]
    }

  });
};
