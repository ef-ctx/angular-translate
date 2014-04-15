module.exports = {

    core: {
        files: {
            '<%= build_dir %>/angular-translate.min.js': '<%= concat.core.dest %>'
        }
    }

};
