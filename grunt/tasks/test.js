module.exports = function (grunt) {
    'use strict';

	grunt.registerTask('test', ['karma:unit', 'karma:midway']);

	// Advanced test tasks
	grunt.registerTask('test-headless', ['karma:headless-unit', 'karma:headless-midway']);
	grunt.registerTask('test-browser-firefox', ['karma:browser-firefox-unit', 'karma:browser-firefox-midway']);
	grunt.registerTask('test-all', ['karma']);
};
