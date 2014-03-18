module.exports = {

    demo: {
        files: [{
            src: 'angular-translate.js',
            dest: 'demo/js/',
            cwd: 'dist/',
            expand: true
        }]
    },

    logos: {
        files: [{
            src: ['logo/**'],
            dest: '<%= ngdocs.options.dest %>/img/',
            cwd: 'identity/',
            expand: true
        }]
    },
    docs_index: {
        files: [{
            src: ['index.html'],
            dest: '<%= ngdocs.options.dest %>/',
            cwd: 'docs/html/',
            expand: true
        }]
    },
    docs_assets: {
        files: [{
            src: ['img/**'],
            dest: '<%= ngdocs.options.dest %>/',
            cwd: 'docs/',
            expand: true
        }, {
            src: ['data/**'],
            dest: '<%= ngdocs.options.dest %>/',
            cwd: 'docs/',
            expand: true
        }]
    }

}
