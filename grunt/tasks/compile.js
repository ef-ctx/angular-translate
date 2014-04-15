module.exports = function(grunt) {
    'use strict';

    grunt.registerTask('compile', [
        'test',
        'clean',
        'jshint',
        'ngtemplates',
        'concat',
        'ngmin',
        'uglify',
        'copy'
    ]);

};
