module.exports = {

    core: {
        files: {
            '<%= build_dir %>/angular-translate.min.js': '<%= concat.core.dest %>'
        }
    },

    ctx: {
        files: {
            '<%= build_dir %>/ctx-angular-translate.min.js': '<%= concat.ctx.dest %>'
        }
    },

    default_interpolation: {
        files: {
            '<%= build_dir %>/angular-translate-interpolation-default/angular-translate-interpolation-default.min.js': '<%= concat.default_interpolation.dest %>'
        }
    },

    messageformat_interpolation: {
        files: {
            '<%= build_dir %>/angular-translate-interpolation-messageformat/angular-translate-interpolation-messageformat.min.js': '<%= concat.messageformat_interpolation.dest %>'
        }
    },

    handler_log: {
        files: {
            '<%= build_dir %>/angular-translate-handler-log/angular-translate-handler-log.min.js': '<%= concat.handler_log.dest %>'
        }
    },

    loader_partial: {
        files: {
            '<%= build_dir %>/angular-translate-loader-partial/angular-translate-loader-partial.min.js': '<%= concat.loader_partial.dest %>'
        }
    },

    loader_static_files: {
        files: {
            '<%= build_dir %>/angular-translate-loader-static-files/angular-translate-loader-static-files.min.js': '<%= concat.loader_static_files.dest %>'
        }
    },

    loader_url: {
        files: {
            '<%= build_dir %>/angular-translate-loader-url/angular-translate-loader-url.min.js': '<%= concat.loader_url.dest %>'
        }
    },

    storage_cookie: {
        files: {
            '<%= build_dir %>/angular-translate-storage-cookie/angular-translate-storage-cookie.min.js': '<%= concat.storage_cookie.dest %>'
        }
    },

    storage_local: {
        files: {
            '<%= build_dir %>/angular-translate-storage-local/angular-translate-storage-local.min.js': '<%= concat.storage_local.dest %>'
        }
    }

};
