module.exports = function (grunt) {
    'use strict';

    grunt.registerTask('docs', [
        'shell:clean_docs',
        'shell:generate_docs'
    ]);

};
