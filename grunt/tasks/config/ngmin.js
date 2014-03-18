module.exports = {

    core: {
        src: '<%= concat.core.dest %>',
        dest: '<%= concat.core.dest %>'
    },

    ctx: {
        src: '<%= concat.ctx.dest %>',
        dest: '<%= concat.ctx.dest %>'
    },

    default_interpolation: {
        src: '<%= concat.default_interpolation.dest %>',
        dest: '<%= concat.default_interpolation.dest %>'
    },

    messageformat_interpolation: {
        src: '<%= concat.messageformat_interpolation.dest %>',
        dest: '<%= concat.messageformat_interpolation.dest %>'
    },

    handler_log: {
        src: '<%= concat.handler_log.dest %>',
        dest: '<%= concat.handler_log.dest %>'
    },

    loader_partial: {
        src: '<%= concat.loader_partial.dest %>',
        dest: '<%= concat.loader_partial.dest %>'
    },

    loader_static_files: {
        src: '<%= concat.loader_static_files.dest %>',
        dest: '<%= concat.loader_static_files.dest %>'
    },

    loader_url: {
        src: '<%= concat.loader_url.dest %>',
        dest: '<%= concat.loader_url.dest %>'
    },

    storage_cookie: {
        src: '<%= concat.storage_cookie.dest %>',
        dest: '<%= concat.storage_cookie.dest %>'
    },

    storage_local: {
        src: '<%= concat.storage_local.dest %>',
        dest: '<%= concat.storage_local.dest %>'
    }

};
