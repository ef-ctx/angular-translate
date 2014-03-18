module.exports = {

    options: {
        dest: 'tmp',
        navTemplate: 'docs/html/nav.html',
        html5Mode: false,
        title: false,
        image: 'identity/logo/angular-translate-alternative/angular-translate_alternative_small2.png',
        imageLink: 'http://pascalprecht.github.io/angular-translate',
        startPage: '/guide',
        scripts: [
            'http://getbootstrap.com/2.3.2/assets/js/bootstrap-dropdown.js',
            'http://rawgithub.com/SlexAxton/messageformat.js/master/messageformat.js',
            'http://rawgithub.com/SlexAxton/messageformat.js/master/locale/de.js',
            'http://code.angularjs.org/1.1.5/angular.min.js',
            'http://rawgithub.com/angular/bower-angular-cookies/master/angular-cookies.min.js',
            'http://rawgithub.com/angular-translate/bower-angular-translate/master/angular-translate.min.js',
            'http://rawgithub.com/angular-translate/bower-angular-translate-interpolation-messageformat/master/angular-translate-interpolation-messageformat.min.js',
            'http://rawgithub.com/angular-translate/bower-angular-translate-storage-cookie/master/angular-translate-storage-cookie.min.js',
            'http://rawgithub.com/angular-translate/bower-angular-translate-storage-local/master/angular-translate-storage-local.min.js',
            'http://rawgithub.com/angular-translate/bower-angular-translate-loader-static-files/master/angular-translate-loader-static-files.min.js',
            'http://rawgithub.com/angular-translate/bower-angular-translate-handler-log/master/angular-translate-handler-log.min.js'
        ],
        styles: ['docs/css/styles.css']
    },
    api: {
        src: [
            'src/translate.js',
            'src/**/*.js',
            'docs/content/api/*.ngdoc'
        ],
        title: 'API Reference'
    },
    guide: {
        src: ['docs/content/guide/<%= language %>/*.ngdoc'],
        title: 'Guide'
    }

};
