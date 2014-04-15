// Karma configuration

module.exports = function(config) {
	config.set({

		basePath: './../',

		frameworks: ['jasmine'],

		files: [
			'bower_components/messageformat/messageformat.js',
			'bower_components/angular/angular.js',
			'bower_components/angular-cookies/angular-cookies.js',
			'bower_components/angular-mocks/angular-mocks.js',
			'src/index.js',
			'src/translate.js',
			'src/service/storage-key.js',
			'src/service/default-interpolation.js',
			'src/service/translate.js',
            'src/service/messageformat-interpolation.js',
			'src/service/loader-static-files.js',
			'src/directive/translate.js',
			'src/filter/translate.js',
			'src/directive/translate-cloak.js',
			'src/directive/locale-selector.js',
            'src/service/handler-log.js',
            'src/service/loader-partial.js',
            'src/service/loader-url.js',
            'src/service/storage-cookie.js',
            'src/service/storage-local.js',
            'src/config.js',
            'tmp/tpl.js',
			'test/unit/**/*.spec.js'
		],

		exclude: [],

		reports: ['progress'],

		port: 9876,

		colors: true,

		// LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
		logLevel: config.LOG_INFO,

		// Start these browsers, currently available:
		// - Chrome
		// - ChromeCanary
		// - Firefox
		// - Opera
		// - Safari (only Mac)
		// - PhantomJS
		// - IE (only Windows)
		browsers: [process.env.TRAVIS ? 'Firefox' : 'Chrome'],

		captureTimeout: 60000,

		singleRun: false,

		plugins: [
			'karma-jasmine',
			'karma-chrome-launcher',
			'karma-firefox-launcher',
			'karma-phantomjs-launcher'
		]
	});
};
