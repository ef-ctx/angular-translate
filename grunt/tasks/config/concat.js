module.exports = {

    banner: {
        options: {
            banner: '<%= meta.banner %>'
        },
        src: '<%= concat.core.dest %>',
        dest: '<%= concat.core.dest %>'
    },

    ctx: {
        options: {
            banner: '(function() {\n\'use strict\';\n\n',
            footer: '\n}());',
            separator: '\n\n',
            process: function(src) {
                // Remove all 'use strict'; from the code and
                // replaces all double blank lines with one
                return src.replace(/'use strict';\n+/g, '')
                    .replace(/\n\n\s*\n/g, '\n\n');
            }
        },
        src: ['<%= lib_files.ctx %>', '<%= tmp_dir %>/tpl.js'],
        dest: '<%= build_dir %>/ctx-angular-translate.js'
    },
    core: {
        src: ['<%= lib_files.core %>'],
        dest: '<%= build_dir %>/angular-translate.js'
    },

    default_interpolation: {
        src: ['<%= lib_files.ext.default_interpolation %>'],
        dest: '<%= build_dir%>/angular-translate-interpolation-default/angular-translate-interpolation-default.js'
    },

    messageformat_interpolation: {
        src: ['<%= lib_files.ext.messageformat_interpolation %>'],
        dest: '<%= build_dir%>/angular-translate-interpolation-messageformat/angular-translate-interpolation-messageformat.js'
    },

    handler_log: {
        src: ['<%= lib_files.ext.handler_log %>'],
        dest: '<%= build_dir %>/angular-translate-handler-log/angular-translate-handler-log.js'
    },

    loader_partial: {
        src: ['<%= lib_files.ext.loader_partial %>'],
        dest: '<%= build_dir %>/angular-translate-loader-partial/angular-translate-loader-partial.js'
    },

    loader_static_files: {
        src: ['<%= lib_files.ext.loader_static_files %>'],
        dest: '<%= build_dir %>/angular-translate-loader-static-files/angular-translate-loader-static-files.js'
    },

    loader_url: {
        src: ['<%= lib_files.ext.loader_url%>'],
        dest: '<%= build_dir %>/angular-translate-loader-url/angular-translate-loader-url.js'
    },

    storage_cookie: {
        src: ['<%= lib_files.ext.storage_cookie %>'],
        dest: '<%= build_dir %>/angular-translate-storage-cookie/angular-translate-storage-cookie.js'
    },

    storage_local: {
        src: ['<%= lib_files.ext.storage_local%>'],
        dest: '<%= build_dir %>/angular-translate-storage-local/angular-translate-storage-local.js'
    }

}
