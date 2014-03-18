module.exports = {

    // Runs standard tests in default browser
    'unit': {
        configFile: 'grunt/karma.unit.conf.js',
        singleRun: true
    },
    'unitCtx': {
        configFile: 'grunt/karma.unit.ctx.conf.js',
        singleRun: true
    },
    'midway': {
        configFile: 'grunt/karma.midway.conf.js',
        singleRun: true
    },

    // Runs standard tests in headless PhantomJS
    'headless-unit': {
        configFile: 'grunt/karma.unit.conf.js',
        singleRun: true,
        browsers: ['PhantomJS']
    },
    'headless-midway': {
        configFile: 'grunt/karma.midway.conf.js',
        singleRun: true,
        browsers: ['PhantomJS']
    },

    // Runs standard tests in Firefox
    'browser-firefox-unit': {
        configFile: 'grunt/karma.unit.conf.js',
        singleRun: true,
        browsers: ['Firefox']
    },
    'browser-firefox-midway': {
        configFile: 'grunt/karma.midway.conf.js',
        singleRun: true,
        browsers: ['Firefox']
    },

    // Opens the default browser on the default port for advanced debugging.
    'debug-unit': {
        configFile: 'grunt/karma.unit.conf.js',
        singleRun: false
    },
    'debug-midway': {
        configFile: 'grunt/karma.midway.conf.js',
        singleRun: false
    }

};
