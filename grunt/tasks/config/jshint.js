module.exports = {

    options: {
        eqeqeq: true,
        globals: {
            angular: true
        }
    },

    all: ['Gruntfile.js', '<%= lib_files.core %>', '<%= lib_files.ext.all %>', '<%= lib_files.test %>'],

    core: {
        files: {
            src: ['<%= lib_files.core %>']
        }
    },

    test: {
        files: {
            src: ['<%= lib_files.test %>']
        }
    }

};
