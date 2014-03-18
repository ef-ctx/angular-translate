module.exports = function (grunt) {
    'use strict';

	grunt.registerTask('dev', ['jshint', 'ngtemplates', 'karma:unit', 'concat', 'watch:livereload']);

};
