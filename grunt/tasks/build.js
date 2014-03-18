module.exports = function (grunt) {
    'use strict';

    grunt.registerTask('build', [
		'jshint:all',
		'karma',
		'build:core',
		'build:messageformat_interpolation',
		'build:handler_log',
		'build:loader_partial',
		'build:loader_static_files',
		'build:loader_url',
		'build:storage_cookie',
		'build:storage_local'
	]);

	grunt.registerTask('build:core', [
		'jshint:core',
		'concat:core',
		'ngmin:core',
		'concat:banner',
		'uglify:core'
	]);

	grunt.registerTask('build:default_interpolation', [
		'jshint:default_interpolation',
		'concat:default_interpolation',
		'ngmin:default_interpolation',
		'uglify:default_interpolation'
	]);

	grunt.registerTask('build:messageformat_interpolation', [
		'jshint:messageformat_interpolation',
		'concat:messageformat_interpolation',
		'ngmin:messageformat_interpolation',
		'uglify:messageformat_interpolation'
	]);

	grunt.registerTask('build:handler_log', [
		'jshint:handler_log',
		'concat:handler_log',
		'ngmin:handler_log',
		'uglify:handler_log'
	]);

	grunt.registerTask('build:loader_partial', [
		'jshint:loader_partial',
		'concat:loader_partial',
		'ngmin:loader_partial',
		'uglify:loader_partial'
	]);

	grunt.registerTask('build:loader_static_files', [
		'jshint:loader_static_files',
		'concat:loader_static_files',
		'ngmin:loader_static_files',
		'uglify:loader_static_files'
	]);

	grunt.registerTask('build:loader_url', [
		'jshint:loader_url',
		'concat:loader_url',
		'ngmin:loader_url',
		'uglify:loader_url'
	]);

	grunt.registerTask('build:storage_cookie', [
		'jshint:storage_cookie',
		'concat:storage_cookie',
		'ngmin:storage_cookie',
		'uglify:storage_cookie'
	]);

	grunt.registerTask('build:storage_local', [
		'jshint:storage_local',
		'concat:storage_local',
		'ngmin:storage_local',
		'uglify:storage_local'
	]);

};
