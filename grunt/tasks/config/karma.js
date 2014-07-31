module.exports = {

    'unit': {
        configFile: 'grunt/karma.conf.js',
        singleRun: true,
        browsers: ['PhantomJS']
    },

    'debug': {
        configFile: 'grunt/karma.conf.js',
        singleRun: false,
        browsers: ['Chrome']
    }

};
