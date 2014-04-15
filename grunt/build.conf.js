module.exports = {

    build_dir: 'build',
    dist_dir: 'dist',
    tmp_dir: 'tmp',

    lib_files: {

        core: [
            'src/index.js',
            'src/config.js',
            'src/service/storage-key.js',
            'src/service/default-interpolation.js',
            'src/service/translate.js',
            'src/service/loader-static-files.js',
            'src/filter/translate.js',
            'src/directive/translate.js',
            'src/directive/locale-selector.js',
            'src/directive/translate-cloak.js',
            'src/translate.js'
        ],

        ext: {
            default_interpolation: ['src/service/default-interpolation.js'],
            messageformat_interpolation: ['src/service/messageformat-interpolation.js'],
            handler_log: ['src/service/handler-log.js'],
            loader_partial: ['src/service/loader-partial.js'],
            loader_static_files: ['src/service/loader-static-files.js'],
            loader_url: ['src/service/loader-url.js'],
            storage_cookie: ['src/service/storage-cookie.js'],
            storage_local: ['src/service/storage-local.js'],
            all: [
                'src/service/default-interpolation.js',
                'src/service/messageformat-interpolation.js',
                'src/service/handler-log.js',
                'src/service/loader-partial.js',
                'src/service/loader-static-files.js',
                'src/service/loader-url.js',
                'src/service/storage-cookie.js',
                'src/service/storage-local.js'
            ]
        },

        templates: ['templates/*.tpl.html'],

        test: ['test/**/*.js']

    }
}
