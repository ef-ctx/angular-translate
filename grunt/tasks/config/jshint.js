module.exports = {

    options: {
        eqeqeq: true,
        globals: {
            angular: true
        }
    },

    all: ['Gruntfile.js', '<%= lib_files.core %>', '<%= lib_files.ext.all %>', '<%= lib_files.test %>'],

    ctx: ['Gruntfile.js', '<%= lib_files.ctx%>'],
    core: {
        files: {
            src: ['<%= lib_files.core %>']
        }
    },

    extensions: {
        files: {
            src: ['<%= lib_files.ext.all %>']
        }
    },

    default_interpolation: {
        files: {
            src: ['<%= lib_files.ext.default_interpolation %>']
        }
    },

    messageformat_interpolation: {
        files: {
            src: ['<%= lib_files.ext.messageformat_interpolation %>']
        }
    },

    handler_log: {
        files: {
            src: ['<%= lib_files.ext.handler_log %>']
        }
    },

    loader_partial: {
        files: {
            src: ['<%= lib_files.ext.loader_partial %>']
        }
    },

    loader_static_files: {
        files: {
            src: ['<%= lib_files.ext.loader_static_files %>']
        }
    },

    loader_url: {
        files: {
            src: ['<%= lib_files.ext.loader_url %>']
        }
    },

    storage_cookie: {
        files: {
            src: ['<%= lib_files.ext.storage_cookie %>']
        }
    },

    storage_local: {
        files: {
            src: ['<%= lib_files.ext.storage_local %>']
        }
    },

    test: {
        files: {
            src: ['<%= lib_files.test %>']
        }
    }

};
