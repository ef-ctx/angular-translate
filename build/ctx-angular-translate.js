(function() {
'use strict';

/**
 * @ngdoc overview
 * @name cxTranslate
 *
 * @description
 * The main module which holds everything together.
 */
var cxTranslate = angular.module('pascalprecht.translate', ['ng']);


cxTranslate
/**
 * @ngdoc object
 * @name pascalprecht.translate.$translateDefaultInterpolation
 * @requires $interpolate
 *
 * @description
 * Uses angular's `$interpolate` services to interpolate strings against some values.
 *
 * @return {object} $translateInterpolator Interpolator service
 */
.factory('$translateDefaultInterpolation', ['$interpolate',
	function($interpolate) {
        		var $translateInterpolator = {},
			$locale,
			$identifier = 'default',
			$sanitizeValueStrategy = null,
			// map of all sanitize strategies
			sanitizeValueStrategies = {
				escaped: function(params) {
					var result = {};
					for (var key in params) {
						if (params.hasOwnProperty(key)) {
							result[key] = angular.element('<div></div>').text(params[key]).html();
						}
					}
					return result;
				}
			};

		var sanitizeParams = function(params) {
			var result;
			if (angular.isFunction(sanitizeValueStrategies[$sanitizeValueStrategy])) {
				result = sanitizeValueStrategies[$sanitizeValueStrategy](params);
			} else {
				result = params;
			}
			return result;
		};

		/**
		 * @ngdoc function
		 * @name pascalprecht.translate.$translateDefaultInterpolation#setLocale
		 * @methodOf pascalprecht.translate.$translateDefaultInterpolation
		 *
		 * @description
		 * Sets current locale (this is currently not use in this interpolation).
		 *
		 * @param {string} locale Language key or locale.
		 */
		$translateInterpolator.setLocale = function(locale) {
			$locale = locale;
		};

		/**
		 * @ngdoc function
		 * @name pascalprecht.translate.$translateDefaultInterpolation#getInterpolationIdentifier
		 * @methodOf pascalprecht.translate.$translateDefaultInterpolation
		 *
		 * @description
		 * Returns an identifier for this interpolation service.
		 *
		 * @returns {string} $identifier
		 */
		$translateInterpolator.getInterpolationIdentifier = function() {
			return $identifier;
		};

		$translateInterpolator.useSanitizeValueStrategy = function(value) {
			$sanitizeValueStrategy = value;
			return this;
		};

		/**
		 * @ngdoc function
		 * @name pascalprecht.translate.$translateDefaultInterpolation#interpolate
		 * @methodOf pascalprecht.translate.$translateDefaultInterpolation
		 *
		 * @description
		 * Interpolates given string agains given interpolate params using angulars
		 * `$interpolate` service.
		 *
		 * @returns {string} interpolated string.
		 */
		$translateInterpolator.interpolate = function(string, interpolateParams) {
			if ($sanitizeValueStrategy) {
				interpolateParams = sanitizeParams(interpolateParams);
			}
			return $interpolate(string)(interpolateParams);
		};

		return $translateInterpolator;
	}
]);


cxTranslate

.factory('fileLoader', [
    '$q',
    '$http',
    function($q, $http) {
                return function(fileConfiguration) {
            var defer = $q.defer(),
                prefix = fileConfiguration.prefix || '',
                suffix = fileConfiguration.suffix || '',
                params = {
                    url: prefix + fileConfiguration.name + suffix,
                    method: 'GET',
                    params: ''
                };

            $http(params).then(function(response) {
                defer.resolve(response.data);
            }, function(error) {
                defer.reject(error);
            });

            return defer.promise;
        };

    }
]);


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
        var setLocale = function setLocale(locale) {
            if (locale) {
                config.locale = locale;
            }
            return locale;
        };
        
        // Exposing set Locale 
        this.setLocale = setLocale;
        // Expose set Locale as pascalPretch in order to make it compatible 
        this.setLanguage = setLocale;
        this.preferredLanguage = setLocale;

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

                var translate = function(translationId, interpolateParams) {
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
                
                var $translate = translate;

                //compatibility with pascalprecht.translate
                $translate.instant = translate;
                
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


cxTranslate
/**
 * @ngdoc filter
 * @name pascalprecht.translate.filter:translate
 * @requires $parse
 * @requires pascalprecht.translate.$translate
 * @function
 *
 * @description
 * Uses `$translate` service to translate contents. Accepts interpolate parameters
 * to pass dynamized values though translation.
 *
 * @param {string} translationId A translation id to be translated.
 * @param {*=} interpolateParams Optional object literal (as hash or string) to pass values into translation.
 *
 * @returns {string} Translated text.
 *
 * @example
   <example module="ngView">
    <file name="index.html">
      <div ng-controller="TranslateCtrl">

        <pre>{{ 'TRANSLATION_ID' | translate }}</pre>
        <pre>{{ translationId | translate }}</pre>
        <pre>{{ 'WITH_VALUES' | translate:'{value: 5}' }}</pre>
        <pre>{{ 'WITH_VALUES' | translate:values }}</pre>

      </div>
    </file>
    <file name="script.js">
      angular.module('ngView', ['pascalprecht.translate'])

      .config(function ($translateProvider) {

        $translateProvider.translations({
          'TRANSLATION_ID': 'Hello there!',
          'WITH_VALUES': 'The following value is dynamic: {{value}}'
        });

      });

      angular.module('ngView').controller('TranslateCtrl', function ($scope) {
        $scope.translationId = 'TRANSLATION_ID';

        $scope.values = {
          value: 78
        };
      });
    </file>
   </example>
 */
.filter('translate', ['$parse', '$translate',
    function($parse, $translate) {
                return function(translationId, interpolateParams){
            var translation;

            if (!angular.isObject(interpolateParams)) {
                interpolateParams = $parse(interpolateParams)();
            }

            try{
                translation = $translate(translationId, interpolateParams);
            } catch(error) {
                translation = undefined;
            }
            
            return translation;
        };
    }
]);


/*jshint -W087 */
cxTranslate
/**
 * @ngdoc directive
 * @name pascalprecht.translate.directive:translate
 * @requires $compile
 * @requires $filter
 * @requires $interpolate
 * @restrict A
 *
 * @description
 * Translates given translation id either through attribute or DOM content.
 * Internally it uses `translate` filter to translate translation id. It possible to
 * pass an optional `translate-values` object literal as string into translation id.
 *
 * @param {string=} translate Translation id which could be either string or interpolated string.
 * @param {string=} translate-values Values to pass into translation id. Can be passed as object literal string or interpolated object.
 *
 * @example
   <example module="ngView">
    <file name="index.html">
      <div ng-controller="TranslateCtrl">

        <pre translate="TRANSLATION_ID"></pre>
        <pre translate>TRANSLATION_ID</pre>
        <pre translate="{{translationId}}"></pre>
        <pre translate>{{translationId}}</pre>
        <pre translate="WITH_VALUES" translate-values="{value: 5}"></pre>
        <pre translate translate-values="{value: 5}">WITH_VALUES</pre>
        <pre translate="WITH_VALUES" translate-values="{{values}}"></pre>
        <pre translate translate-values="{{values}}">WITH_VALUES</pre>

      </div>
    </file>
    <file name="script.js">
      angular.module('ngView', ['pascalprecht.translate'])

      .config(function ($translateProvider) {

        $translateProvider.translations({
          'TRANSLATION_ID': 'Hello there!',
          'WITH_VALUES': 'The following value is dynamic: {{value}}'
        });

      });

      angular.module('ngView').controller('TranslateCtrl', function ($scope) {
        $scope.translationId = 'TRANSLATION_ID';

        $scope.values = {
          value: 78
        };
      });
    </file>
    <file name="scenario.js">
      it('should translate', function () {
        inject(function ($rootScope, $compile) {
          $rootScope.translationId = 'TRANSLATION_ID';

          element = $compile('<p translate="TRANSLATION_ID"></p>')($rootScope);
          $rootScope.$digest();
          expect(element.text()).toBe('Hello there!');

          element = $compile('<p translate="{{translationId}}"></p>')($rootScope);
          $rootScope.$digest();
          expect(element.text()).toBe('Hello there!');

          element = $compile('<p translate>TRANSLATION_ID</p>')($rootScope);
          $rootScope.$digest();
          expect(element.text()).toBe('Hello there!');

          element = $compile('<p translate>{{translationId}}</p>')($rootScope);
          $rootScope.$digest();
          expect(element.text()).toBe('Hello there!');
        });
      });
    </file>
   </example>
 */
.directive('translate', ['$translate', '$parse',
    function($translate, $parse) {
                return {
            restrict: 'AE',
            scope: {
                translate: '@'
            },
            link: function($scope, $element, $attrs) {
                var translate = function translate() {
                        var prefix = ($attrs.prefix) ? $element[0].attributes.getNamedItem($attrs.$attr.prefix).value : '',
                            suffix = ($attrs.suffix) ? $element[0].attributes.getNamedItem($attrs.$attr.suffix).value : '';

                        try {
                            $element.html(prefix + $translate($scope.translate, $scope.interpolateParams) + suffix);
                        } catch (error) {}
                    };

                $scope.interpolateParams = {};
                
                if ($attrs.translateValues) {
                    $scope.interpolateParams = $parse($attrs.translateValues)($scope.$parent);
                    $attrs.$observe('translateValues', function(interpolateParams) {
                        if (interpolateParams) {
                            $scope.$parent.$watch(function() {
                                angular.extend($scope.interpolateParams, $parse(interpolateParams)($scope.$parent));
                            });
                        }
                    });
                }

                $scope.fallbackValue = $element.html();

                $scope.$watch('translate', translate);
                $scope.$watch('interpolateParams', translate, true);

                translate();
            }
        };

    }
]);


cxTranslate.run([
    '$translate',
    function($translate) {
                $translate.loadFile();
    }
]);



}());