module.exports = {

    core: {
        files: {
            '<%= build_dir %>/ctx-angular-translate.min.js': '<%= concat.core.dest %>'
        }
    }

};
