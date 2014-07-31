ngTranslate
/**
 * @ngdoc object
 * @name pascalprecht.translate.$translateProvider
 * @description
 *
 * $translateProvider allows developers to register translation-tables, asynchronous loaders
 * and similar to configure translation behavior directly inside of a module.
 *
 */
.provider('$translate', [

    function() {
        'use strict';

        var $translationTable = {},
            $preferredLanguage,
            $availableLanguageKeys = [],
            $languageKeyAliases,
            $uses,
            $missingTranslationHandlerFactory,
            $interpolationFactory,
            $interpolatorFactories = [],
            $interpolationSanitizationStrategy = false,
            $loaderFactory,
            $loaderOptions,
            $linkKeyRegExp = /@\:\((.*?)?\)/g,
            NESTED_OBJECT_DELIMITER = '.';

        /**
         * @ngdoc function
         * @name pascalprecht.translate.$translateProvider#translations
         * @methodOf pascalprecht.translate.$translateProvider
         *
         * @description
         * Registers a new translation table for specific language key.
         *
         * To register a translation table for specific language, pass a defined language
         * key as first parameter.
         *
         * <pre>
         *  // register translation table for language: 'de_DE'
         *  $translateProvider.translations('de_DE', {
         *    'GREETING': 'Hallo Welt!'
         *  });
         *
         *  // register another one
         *  $translateProvider.translations('en_US', {
         *    'GREETING': 'Hello world!'
         *  });
         * </pre>
         *
         * When registering multiple translation tables for for the same language key,
         * the actual translation table gets extended. This allows you to define module
         * specific translation which only get added, once a specific module is loaded in
         * your app.
         *
         * Invoking this method with no arguments returns the translation table which was
         * registered with no language key. Invoking it with a language key returns the
         * related translation table.
         *
         * @param {string} key A language key.
         * @param {object} translationTable A plain old JavaScript object that represents a translation table.
         *
         */
        var translations = function(langKey, translationTable) {

            if (!langKey && !translationTable) {
                return $translationTable;
            }

            if (langKey && !translationTable) {
                if (angular.isString(langKey)) {
                    return $translationTable[langKey];
                }
            } else {
                if (!angular.isObject($translationTable[langKey])) {
                    $translationTable[langKey] = {};
                }
                angular.extend($translationTable[langKey], flatObject(translationTable));
            }
            return this;
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
         * @name pascalprecht.translate.$translateProvider#addInterpolation
         * @methodOf pascalprecht.translate.$translateProvider
         *
         * @description
         * Adds interpolation services to angular-translate, so it can manage them.
         *
         * @param {object} factory Interpolation service factory
         */
        this.addInterpolation = function(factory) {
            $interpolatorFactories.push(factory);
            return this;
        };

        /**
         * @ngdoc function
         * @name pascalprecht.translate.$translateProvider#preferredLanguage
         * @methodOf pascalprecht.translate.$translateProvider
         *
         * @description
         * Tells the module which of the registered translation tables to use for translation
         * at initial startup by passing a language key. Similar to `$translateProvider#use`
         * only that it says which language to **prefer**.
         *
         * @param {string} langKey A language key.
         *
         */
        this.preferredLanguage = function(langKey) {
            if (langKey) {
                $preferredLanguage = langKey;
                return this;
            }
            return $preferredLanguage;
        };

        /**
         * @ngdoc function
         * @name pascalprecht.translate.$translateProvider#use
         * @methodOf pascalprecht.translate.$translateProvider
         *
         * @description
         * Set which translation table to use for translation by given language key. When
         * trying to 'use' a language which isn't provided, it'll throw an error.
         *
         * You actually don't have to use this method since `$translateProvider#preferredLanguage`
         * does the job too.
         *
         * @param {string} langKey A language key.
         */
        this.use = function(langKey) {
            if (langKey) {
                if (!$translationTable[langKey]) {
                    // only throw an error, when not loading translation data asynchronously
                    throw new Error('$translateProvider couldn`t find translationTable for langKey: ' + langKey);
                }
                $uses = langKey;
                return this;
            }
            return $uses;
        };

        /**
         * @ngdoc function
         * @name pascalprecht.translate.$translateProvider#useStaticFilesLoader
         * @methodOf pascalprecht.translate.$translateProvider
         *
         * @description
         * Tells angular-translate to use `$translateStaticFilesLoader` extension service as loader.
         *
         * @param {Object=} options Optional configuration object
         */
        this.useStaticFilesLoader = function(options) {
            return this.useLoader('$translateStaticFilesLoader', options);
        };

        /**
         * @ngdoc function
         * @name pascalprecht.translate.$translateProvider#useLoader
         * @methodOf pascalprecht.translate.$translateProvider
         *
         * @description
         * Tells angular-translate to use any other service as loader.
         *
         * @param {string} loaderFactory Factory name to use
         * @param {Object=} options Optional configuration object
         */
        this.useLoader = function(loaderFactory, options) {
            $loaderFactory = loaderFactory;
            $loaderOptions = options || {};
            return this;
        };

        /**
         * @ngdoc function
         * @name pascalprecht.translate.$translateProvider#registerAvailableLanguageKeys
         * @methodOf pascalprecht.translate.$translateProvider
         *
         * @description
         * Registers a set of language keys the app will work with. Use this method in
         * combination with
         * {@link pascalprecht.translate.$translateProvider#determinePreferredLanguage determinePreferredLanguage}.
         * When available languages keys are registered, angular-translate
         * tries to find the best fitting language key depending on the browsers locale,
         * considering your language key convention.
         *
         * @param {object} languageKeys Array of language keys the your app will use
         * @param {object=} aliases Alias map.
         */
        this.registerAvailableLanguageKeys = function(languageKeys, aliases) {
            if (languageKeys) {
                $availableLanguageKeys = languageKeys;
                if (aliases) {
                    $languageKeyAliases = aliases;
                }
                return this;
            }
            return $availableLanguageKeys;
        };

        /**
         * @ngdoc function
         * @name pascalprecht.translate.$translateProvider#linkKeyRegExp
         * @methodOf pascalprecht.translate.$translateProvider
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
                $linkKeyRegExp = exp;
                return this;
            }
            return $linkKeyRegExp;
        };

        /**
         * @ngdoc object
         * @name pascalprecht.translate.$translate
         * @requires $interpolate
         * @requires $log
         * @requires $rootScope
         * @requires $q
         *
         * @description
         * The `$translate` service is the actual core of angular-translate. It expects a translation id
         * and optional interpolate parameters to translate contents.
         *
         * <pre>
         *  $scope.translatedText = $translate('HEADLINE_TEXT');
         * </pre>
         *
         * @param {string} translationId A token which represents a translation id
         * @param {object=} interpolateParams An object hash for dynamic values
         */
        this.$get = [
            '$log',
            '$injector',
            '$rootScope',
            '$http',
            '$q',
            function($log, $injector, $rootScope, $http, $q) {

                var defaultInterpolator = $injector.get($interpolationFactory || '$translateDefaultInterpolation'),
                    pendingLoader = false,
                    interpolatorHashMap = {},
                    langPromises = {};

                var $translate = function(translationId, interpolateParams, interpolationId) {
                    var deferred = $q.defer();
                    // trim off any whitespace
                    translationId = translationId.trim();

                    var promiseToWaitFor = (function() {
                        var promise = $preferredLanguage ?
                            langPromises[$preferredLanguage] :
                            langPromises[$uses];

                        return promise;
                    }());

                    if (!promiseToWaitFor) {
                        // no promise to wait for? okay. Then there's no loader registered
                        // nor is a one pending for language that comes from storage.
                        // We can just translate.
                        determineTranslation(translationId, interpolateParams, interpolationId).then(deferred.resolve, deferred.reject);
                    } else {
                        promiseToWaitFor.then(function() {
                            determineTranslation(translationId, interpolateParams, interpolationId).then(deferred.resolve, deferred.reject);
                        });
                    }
                    return deferred.promise;
                };

                /**
                 * @name useLanguage
                 * @private
                 *
                 * @description
                 * Makes actual use of a language by setting a given language key as used
                 * language and informs registered interpolators to also use the given
                 * key as locale.
                 *
                 * @param {key} Locale key.
                 */
                var useLanguage = function(key) {
                    $uses = key;
                    $rootScope.$emit('$translateChangeSuccess');
                    // inform default interpolator
                    defaultInterpolator.setLocale($uses);
                    // inform all others to!
                    angular.forEach(interpolatorHashMap, function(interpolator, id) {
                        interpolatorHashMap[id].setLocale($uses);
                    });
                    $rootScope.$emit('$translateChangeEnd');
                };

                // if we have additional interpolations that were added via
                // $translateProvider.addInterpolation(), we have to map'em
                if ($interpolatorFactories.length) {
                    angular.forEach($interpolatorFactories, function(interpolatorFactory) {
                        var interpolator = $injector.get(interpolatorFactory);
                        // setting initial locale for each interpolation service
                        interpolator.setLocale($preferredLanguage || $uses);
                        // apply additional settings
                        if (angular.isFunction(interpolator.useSanitizeValueStrategy)) {
                            interpolator.useSanitizeValueStrategy($interpolationSanitizationStrategy);
                        }
                        // make'em recognizable through id
                        interpolatorHashMap[interpolator.getInterpolationIdentifier()] = interpolator;
                    });
                }

                // search link keys recursively in the same translation table 
                var translateKey = function(key, translationTable) {
                    var value = translationTable.hasOwnProperty(key) ? translationTable[key] : undefined;

                    if (value !== undefined) {
                        if (value.match($linkKeyRegExp) && value.match($linkKeyRegExp).length > 0) {
                            return value.replace($linkKeyRegExp, function(str, p1) {
                                return translateKey(p1, translationTable);
                            });
                        } else {
                            return value;
                        }
                    } else {
                        throw new Error('translation error : ' + key + ' key not found error');
                    }

                };

                /**
                 * @name loadLocaleFile
                 * @private
                 *
                 * @description
                 * Loads the locale file and crates the translation Table
                 * @param {string} key Language key.
                 * @return {Promise} A promise.
                 */
                var loadLocaleFile = function(key) {
                    if (!key) {
                        throw 'No language key specified for loading.';
                    }

                    var deferred = $q.defer();
                    var params = {
                        url: [
                            ($loaderOptions && $loaderOptions.prefix) ? $loaderOptions.prefix : '',
                            key, ($loaderOptions && $loaderOptions.suffix) ? $loaderOptions.suffix : ''
                        ].join(''),
                        method: 'GET',
                        params: ''
                    };
                    $http(params)
                        .then(function(response) {

                            var translationTable = {},
                                data = response.data;
                                    
                            if (angular.isArray(data)) {
                                angular.forEach(data, function(table) {
                                    angular.extend(translationTable, flatObject(table));
                                });
                            } else {
                                angular.extend(translationTable, flatObject(data));
                            }
                            translations(key, translationTable);
                            useLanguage(key);
                        }, function(key) {
                            deferred.reject(key);
                        });
                    return deferred.promise;
                };

                /**
                 * @name getTranslationTable
                 * @private
                 *
                 * @description
                 * Returns a promise that resolves to the translation table
                 * or is rejected if an error occurred.
                 *
                 * @param langKey
                 * @returns {Q.promise}
                 */
                var determineTranslation = function(translationId, interpolateParams, interpolationId) {

                    var deferred = $q.defer(),
                        table = $uses ? $translationTable[$uses] : $translationTable,
                        Interpolator = (interpolationId) ? interpolatorHashMap[interpolationId] : defaultInterpolator;

                    try {
                        deferred.resolve(Interpolator.interpolate(translateKey(translationId, table), interpolateParams));
                    } catch (error) {
                        deferred.reject(error);
                    }
                    return deferred.promise;
                };

                /**
                 * @name getTranslationTable
                 * @private
                 *
                 * @description
                 * Returns a promise that resolves to the translation table
                 * or is rejected if an error occurred.
                 *
                 * @param langKey
                 * @returns {Q.promise}
                 */
                var determineTranslationInstant = function(translationId, interpolateParams, interpolationId) {

                    var result,
                        table = $uses ? $translationTable[$uses] : $translationTable,
                        Interpolator = (interpolationId) ? interpolatorHashMap[interpolationId] : defaultInterpolator;

                    try {
                        result = Interpolator.interpolate(translateKey(translationId, table), interpolateParams);
                    } catch (error) {
                        console.error(error);
                    }
                    return result;
                };



                /**
                 * @ngdoc function
                 * @name pascalprecht.translate.$translate#preferredLanguage
                 * @methodOf pascalprecht.translate.$translate
                 *
                 * @description
                 * Returns the language key for the preferred language.
                 *
                 * @return {string} preferred language key
                 */
                $translate.preferredLanguage = function() {
                    return $preferredLanguage;
                };


                /**
                 * @ngdoc function
                 * @name pascalprecht.translate.$translate#use
                 * @methodOf pascalprecht.translate.$translate
                 *
                 * @description
                 * Tells angular-translate which language to use by given language key. This method is
                 * used to change language at runtime. It also takes care of storing the language
                 * key in a configured store to let your app remember the choosed language.
                 *
                 * When trying to 'use' a language which isn't available it tries to load it
                 * asynchronously with registered loaders.
                 *
                 * Returns promise object with loaded language file data
                 * @example
                 * $translate.use("en_US").then(function(data){
                 *   $scope.text = $translate("HELLO");
                 * });
                 *
                 * @param {string} key Language key
                 * @return {string} Language key
                 */
                $translate.use = function(key) {
                    if (!key) {
                        return $uses;
                    }
                    return loadLocaleFile(key);
                };


                /**
                 * @ngdoc function
                 * @name pascalprecht.translate.$translate#instant
                 * @methodOf pascalprecht.translate.$translate
                 *
                 * @description
                 * Returns a translation instantly from the internal state of loaded translation. All rules
                 * regarding the current language, the preferred language of even fallback languages will be
                 * used except any promise handling. If a language was not found, an asynchronous loading
                 * will be invoked in the background.
                 *
                 * @param {string} langKey The language to translate to.
                 * @param {string} translationId Translation ID
                 * @param {object} interpolateParams Params
                 *
                 * @return {string} translation
                 */
                $translate.instant = function(translationId, interpolateParams, interpolationId) {

                    if (typeof translationId === 'undefined' || translationId === '') {
                        return translationId;
                    }

                    translationId = translationId.trim();

                    var result, possibleLangKeys = [];
                    if ($preferredLanguage) {
                        possibleLangKeys.push($preferredLanguage);
                    }

                    if ($uses) {
                        possibleLangKeys.push($uses);
                    }

                    for (var i = 0, c = possibleLangKeys.length; i < c; i++) {
                        var possibleLangKey = possibleLangKeys[i];
                        if ($translationTable[possibleLangKey]) {
                            if ($translationTable[possibleLangKey][translationId]) {
                                result = determineTranslationInstant(translationId, interpolateParams, interpolationId);
                            }
                        }
                        if (typeof result !== 'undefined') {
                            break;
                        }
                    }

                    if (!result) {
                        // Return translation if not found anything.
                        result = undefined;
                        if ($missingTranslationHandlerFactory && !pendingLoader) {
                            $injector.get($missingTranslationHandlerFactory)(translationId, $uses);
                        }
                    }

                    return result;
                };

                return $translate;
            }
        ];


    }
]);
