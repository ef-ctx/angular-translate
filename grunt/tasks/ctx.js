module.exports = function(grunt) {
    'use strict';

    grunt.registerTask('ctx', [
        'clean',
        'jshint:ctx',
        'ngtemplates',
        'concat:ctx',
        'ngmin:ctx',
        'uglify:ctx'
    ]);

};
