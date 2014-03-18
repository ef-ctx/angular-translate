module.exports = {

    scripts: {
        files: ['Gruntfile.js', '<%= lib_files.core %>', '<%= lib_files.ext.all %>', '<%= lib_files.test %>', '<%= lib_files.templates %>'],
        tasks: ['jshint:all', 'karma:unit']
    },

    livereload: {
        options: {
            livereload: true
        },
        // TODO actually complete demo except copied "angular-translate-latest.js"
        files: ['src/**/*.js', '<%= lib_files.templates %>'],
        tasks: ['jshint', 'ngtemplates', 'karma:unit', 'concat']
    }

};
