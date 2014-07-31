module.exports = {

    scripts: {
        files: ['Gruntfile.js', '<%= lib_files.core %>', '<%= lib_files.ext.all %>', '<%= lib_files.test %>', '<%= lib_files.templates %>', '<%= lib_files.test %>'],
        tasks: ['jshint:all', 'ngtemplates', 'karma:unit', 'concat', 'copy' ]
    },

    livereload: {
        options: {
            livereload: true
        },
        // TODO actually complete demo except copied "angular-translate-latest.js"
        files: ['src/**/*.js', '<%= lib_files.templates %>','<%= lib_files.test %>'],
        tasks: ['jshint', 'ngtemplates', 'karma:unit', 'concat', 'copy']
    }

};
