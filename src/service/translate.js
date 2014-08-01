cxTranslate

/**
 * @ngdoc object
 * @name cxTranslate.$translateProvider
 * @description
 *
 * $translateProvider allows developers to register translation-tables to configure translation behavior directly inside of a module.
 */
.provider('$translate', [

    function() {
        'use strict';

        var translationTable = {},
            config = {
                linkKeyRegExp: /@\:\((.*?)?\)/g
                /*
                file: {
                    prefix: '',
                    suffix: '',
                    name: ''
                },
                locale: ''
                */
            },
            NESTED_OBJECT_DELIMITER = '.';


        /**
         * @ngdoc function
         * @name cxTranslate.$translateProvider#translations
         * @methodOf cxTranslate.$translateProvider
         *
         * @description
         * Registers a new translation table 
         *
         * @param {object} translationTable A plain old JavaScript object that represents a translation table.
         */
        var translations = function(data) {
            if (data) {
                translationTable = angular.extend(translationTable, flatObject(data));
            }
            return translationTable;
        };

        this.translations = translations;

        /**
         * @name flatObject
         * @private
         *
         * @description
         * Flats an object. This function is used to flatten given translation data with
         * namespaces, so they are later accessible via dot notation.
         */
        var flatObject = function(data, path, result, prevKey) {
            var key, keyWithPath, keyWithShortPath, val;

            if (!path) {
                path = [];
            }
            if (!result) {
                result = {};
            }
            for (key in data) {
                if (!data.hasOwnProperty(key)) {
                    continue;
                }
                val = data[key];
                if (angular.isObject(val)) {
                    flatObject(val, path.concat(key), result, key);
                } else {
                    keyWithPath = path.length ? ('' + path.join(NESTED_OBJECT_DELIMITER) + NESTED_OBJECT_DELIMITER + key) : key;
                    if (path.length && key === prevKey) {
                        // Create shortcut path (foo.bar == foo.bar.bar)
                        keyWithShortPath = '' + path.join(NESTED_OBJECT_DELIMITER);
                        // Link it to original path
                        result[keyWithShortPath] = '@:' + keyWithPath;
                    }
                    result[keyWithPath] = val;
                }
            }
            return result;
        };

        /**
         * @ngdoc function
         * @name cxTranslate.$translateProvider#setLocale
         * @methodOf cxTranslate.$translateProvider
         * @description
         * Sets locale in config.locale
         * @param {string} locale A language key.
         */
        this.setLocale = function setLocale(locale) {
            if (locale) {
                config.locale = locale;
            }
            return locale;
        };


        /**
         * @ngdoc function
         * @name cxTranslate.$translateProvider#configure
         * @methodOf cxTranslate.$translateProvider
         * @description
         * Sets configuration of the provider 
         * @param {object} the JSON representation of the configuration 
         */
        this.configure = function configure(data) {
            angular.extend(config, data);
        };

        /**
         * @ngdoc function
         * @name cxTranslate.$translateProvider#linkKeyRegExp
         * @methodOf cxTranslate.$translateProvider
         *
         * @description
         * Tells the module what will be the regular expresion to match linked keys on
         * the value of other keys.
         * It is setted as default as /@\:\((.*?)?\)/g matching @:(key).
         *
         * An Example would be:
         * "example": {
         *    "simple": {
         *        "key1" : "value for the generic key1",
         *        "key2" : "value for the generic key2"
         *    },
         *    "composed": {
         *        "composition1": " this is @:(example.simple.key1) and @:(example.simple.key2)"
         *        "composition2": " this is @:(example.simple.key2) and @:(example.simple.key1)"
         *    }
         * }
         *
         * @param {RegExp} exp A regular expresion.
         *
         */
        this.linkKeyRegExp = function(exp) {
            if (exp) {
                config.linkKeyRegExp = exp;
                return this;
            }
            return config.linkKeyRegExp;
        };

        // search link keys recursively in the same translation table 
        var translateKey = function(key) {
            var value = translationTable.hasOwnProperty(key) ? translationTable[key] : undefined,
                keyRE = config.linkKeyRegExp;

            if (value !== undefined) {
                if (value.match(keyRE) && value.match(keyRE).length > 0) {
                    return value.replace(keyRE, function(str, p1) {
                        return translateKey(p1, translationTable);
                    });
                } else {
                    return value;
                }
            } else {
                throw new Error('cxTranslate.Translation Error : ' + key + ' key not found error');
            }

        };

        /**
         * @ngdoc object
         * @name cxTranslate.$translate
         * @requires $interpolate
         *
         * @description
         * The `$translate` service is the actual core of angular-translate. It expects a translation id
         * and optional interpolate parameters to translate contents.
         *
         * @param {string} translationId A token which represents a translation id
         * @param {object=} interpolateParams An object hash for dynamic values
         */
        this.$get = [
            '$injector',
            function($injector) {

                var interpolator = $injector.get('$translateDefaultInterpolation'),
                    fileLoader = $injector.get('fileLoader');

                interpolator.setLocale(config.locale);

                var $translate = function(translationId, interpolateParams) {
                    var result;
                    translationId = translationId.trim();

                    if (typeof translationId === 'undefined' || translationId === '') {
                        result = translationId;
                    } else {
                        try {
                            result = interpolator.interpolate(translateKey(translationId), interpolateParams) || '';
                        } catch (error) {
                            throw new Error('cxTranslate.Translation Error : Trying to resolve ' + translationId + ' a key or a sub key was not found', error);
                        }
                    }
                    
                    return result ;
                };

                /**
                 * @ngdoc function
                 * @name cxTranslate.$translate#getLocale
                 * @methodOf cxTranslate.$translate
                 *
                 * @description
                 * Returns the language key for the preferred language.
                 *
                 * @return {string} preferred language key
                 */
                $translate.getLocale = function() {
                    return config.locale;
                };

                /**
                 * @ngdoc function
                 * @name cxTranslate.$translate#getConfig
                 * @methodOf cxTranslate.$translate
                 *
                 * @description
                 * Returns the setted configuration of the serverw
                 *
                 * @return {string} preferred language key
                 */
                $translate.getConfig = function () {
                    return config;
                };

                /**
                 * @name loadFile
                 * @private
                 *
                 * @description
                 * Loads the locale file and creates the translation Table
                 * @param {string} key Language key.
                 * @return {Promise} A promise.
                 */
                $translate.loadFile = function(fileConfig) {

                    fileConfig = fileConfig || config.file;
                    
                    if(fileConfig) {
                        fileLoader(fileConfig).then(function(data) {
                            translations(data);
                        }, function(error) {
                            console.error(error);
                        });
                    } else {
                        throw new Error('cxTranslate.loadFile function error: No file properly configured to be loaded');
                    }
                };
                
                return $translate;
            }

        ];
    }
]);
