module.exports = function (config) {

  var configuration = {
    basePath: '..', //!\\ Ignored through gulp-karma //!\\

    files: [ //!\\ Ignored through gulp-karma //!\\
      'app/bower_components/angular/angular.js',
      'app/bower_components/angular/angular-route.js',
      'app/bower_components/angular-mocks/angular-mocks.js',
      'app/scripts/** /*.js',
      'test/unit/** /*.js'
    ],

    autoWatch: false,

    frameworks: ['jasmine'],

    browsers: ['PhantomJS', 'Chrome', 'Firefox'],

    customLaunchers: {
      Chrome_without_security: {
        base: 'Chrome',
        flags: ['--disable-web-security']
      },
      Chrome_travis_ci: {
        base: 'Chrome',
        flags: ['--no-sandbox']
      }
    },

    plugins: [
      'karma-phantomjs-launcher',
      'karma-firefox-launcher',
      'karma-chrome-launcher',
      'karma-ie-launcher',
      'karma-jasmine'
    ]

  };

  if (process.env.TRAVIS) {
    configuration.browsers = ['PhantomJS', 'Firefox', 'Chrome_travis_ci'];
  }

  if (process.platform === 'win32') {
    // @link https://github.com/karma-runner/karma-phantomjs-launcher/issues/27
    // @link https://github.com/karma-runner/karma/issues/931
    configuration.browsers.splice(configuration.browsers.indexOf('PhantomJS'), 1);
    configuration.browsers.push('IE');
  }

  config.set(configuration);
}
