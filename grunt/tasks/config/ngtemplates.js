module.exports = {

    ngTagsInput: {
        files: {
            '<%= tmp_dir %>/tpl.js': ['templates/*.tpl.html']
        },
        options: {
            url: function(url) {
                return 'templates/' + url.replace('templates/', '');
            },
            bootstrap: function(module, script) {
                return '/* HTML templates */\n' +
                    'ngTranslate.run(function($templateCache) {\n' + script + '});\n';
            },
            htmlmin: {
                collapseWhitespace: true,
                removeRedundantAttributes: true
            }
        }
    }

};
