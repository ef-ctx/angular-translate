module.exports = {

    banner: {
        options: {
            banner: '<%= meta.banner %>'
        },
        src: '<%= concat.core.dest %>',
        dest: '<%= concat.core.dest %>'
    },

    core: {
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
        src: ['<%= lib_files.core %>', '<%= tmp_dir %>/tpl.js'],
        dest: '<%= build_dir %>/ctx-angular-translate.js'
    },

}
