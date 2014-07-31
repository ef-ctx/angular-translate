module.exports = function (grunt) {
    'use strict';

    grunt.renameTask('watch', 'dev');

	grunt.registerTask('watch', ['jshint', 'ngtemplates', 'karma:unit', 'concat', 'copy', 'dev:livereload']);

};
