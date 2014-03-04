/**
 * @ngdoc overview
 * @name pascalprecht.translate
 *
 * @description
 * The main module which holds everything together.
 */
var ngTranslate = angular.module('pascalprecht.translate', ['ng']);

ngTranslate

.value('ngTranslateConfig',{

    "directive": {
        "localeSelector": {
            "buttonLabel": "Language",
            "L10n": "localeSelector.buttonLabel"
        }
    },
    "languageLabels": {
        "en_US": "English (United States)",
        "en_GB": "English (Great Britain)",
        "es_ES": "Español (España)",
        "fr_FR": "Français",
        "pt_PT": "Português"
    }

});

ngTranslate.run([
	'$translate',
	function($translate) {
		'use strict';

		var key = $translate.storageKey(),
			storage = $translate.storage();

		if (storage) {
			if (!storage.get(key)) {
				if (angular.isString($translate.preferredLanguage())) {
					$translate.use($translate.preferredLanguage());
				} else {
					storage.set(key, $translate.use());
				}
			} else {
				$translate.use(storage.get(key));
			}
		} else if (angular.isString($translate.preferredLanguage())) {
			$translate.use($translate.preferredLanguage());
		}
	}
]);

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
.provider('$translate', ['$STORAGE_KEY',
	function($STORAGE_KEY) {
		'use strict';

		var $translationTable = {},
			$preferredLanguage,
			$availableLanguageKeys = [],
			$languageKeyAliases,
			$uses,
			$nextLang,
			$storageFactory,
			$storageKey = $STORAGE_KEY,
			$storagePrefix,
			$missingTranslationHandlerFactory,
			$interpolationFactory,
			$interpolatorFactories = [],
			$interpolationSanitizationStrategy = false,
			$loaderFactory,
			$cloakClassName = 'translate-cloak',
			$loaderOptions,
			$notFoundIndicatorLeft,
			$notFoundIndicatorRight,
			$postCompilingEnabled = false,
			$linkKeyRegExp = /@\:\((.*?)?\)/g,
			NESTED_OBJECT_DELIMITER = '.';


		// tries to determine the browsers locale
		var getLocale = function() {
			var nav = window.navigator;
			return ((
				nav.language ||
				nav.browserLanguage ||
				nav.systemLanguage ||
				nav.userLanguage
			) || '').split('-').join('_');
		};

		var negotiateLocale = function(preferred) {

			var avail = [],
				locale = angular.lowercase(preferred),
				i = 0,
				n = $availableLanguageKeys.length;

			for (; i < n; i++) {
				avail.push(angular.lowercase($availableLanguageKeys[i]));
			}

			if (avail.indexOf(locale) > -1) {
				return locale;
			}

			if ($languageKeyAliases) {

				if ($languageKeyAliases[preferred]) {
					var alias = $languageKeyAliases[preferred];

					if (avail.indexOf(angular.lowercase(alias)) > -1) {
						return alias;
					}
				}
			}

			var parts = preferred.split('_');

			if (parts.length > 1 && avail.indexOf(angular.lowercase(parts[0])) > 1) {
				return parts[0];
			}
		};

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
		 * @ngdoc function
		 * @name pascalprecht.translate.$translateProvider#cloakClassName
		 * @methodOf pascalprecht.translate.$translateProvider
		 *
		 * @description
		 *
		 * Let's you change the class name for `translate-cloak` directive.
		 * Default class name is `translate-cloak`.
		 *
		 * @param {string} name translate-cloak class name
		 */
		this.cloakClassName = function(name) {
			if (!name) {
				return $cloakClassName;
			}
			$cloakClassName = name;
			return this;
		};

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
		 * @name pascalprecht.translate.$translateProvider#useMessageFormatInterpolation
		 * @methodOf pascalprecht.translate.$translateProvider
		 *
		 * @description
		 * Tells angular-translate to use interpolation functionality of messageformat.js.
		 * This is useful when having high level pluralization and gender selection.
		 */
		this.useMessageFormatInterpolation = function() {
			return this.useInterpolation('$translateMessageFormatInterpolation');
		};

		/**
		 * @ngdoc function
		 * @name pascalprecht.translate.$translateProvider#useInterpolation
		 * @methodOf pascalprecht.translate.$translateProvider
		 *
		 * @description
		 * Tells angular-translate which interpolation style to use as default, application-wide.
		 * Simply pass a factory/service name. The interpolation service has to implement
		 * the correct interface.
		 *
		 * @param {string} factory Interpolation service name.
		 */
		this.useInterpolation = function(factory) {
			$interpolationFactory = factory;
			return this;
		};

		/**
		 * @ngdoc function
		 * @name pascalprecht.translate.$translateProvider#useSanitizeStrategy
		 * @methodOf pascalprecht.translate.$translateProvider
		 *
		 * @description
		 * Simply sets a sanitation strategy type.
		 *
		 * @param {string} value Strategy type.
		 */
		this.useSanitizeValueStrategy = function(value) {
			$interpolationSanitizationStrategy = value;
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
		 * @name pascalprecht.translate.$translateProvider#translationNotFoundIndicator
		 * @methodOf pascalprecht.translate.$translateProvider
		 *
		 * @description
		 * Sets an indicator which is used when a translation isn't found. E.g. when
		 * setting the indicator as 'X' and one tries to translate a translation id
		 * called `NOT_FOUND`, this will result in `X NOT_FOUND X`.
		 *
		 * Internally this methods sets a left indicator and a right indicator using
		 * `$translateProvider.translationNotFoundIndicatorLeft()` and
		 * `$translateProvider.translationNotFoundIndicatorRight()`.
		 *
		 * **Note**: These methods automatically add a whitespace between the indicators
		 * and the translation id.
		 *
		 * @param {string} indicator An indicator, could be any string.
		 */
		this.translationNotFoundIndicator = function(indicator) {
			this.translationNotFoundIndicatorLeft(indicator);
			this.translationNotFoundIndicatorRight(indicator);
			return this;
		};

		/**
		 * ngdoc function
		 * @name pascalprecht.translate.$translateProvider#translationNotFoundIndicatorLeft
		 * @methodOf pascalprecht.translate.$translateProvider
		 *
		 * @description
		 * Sets an indicator which is used when a translation isn't found left to the
		 * translation id.
		 *
		 * @param {string} indicator An indicator.
		 */
		this.translationNotFoundIndicatorLeft = function(indicator) {
			if (!indicator) {
				return $notFoundIndicatorLeft;
			}
			$notFoundIndicatorLeft = indicator;
			return this;
		};

		/**
		 * ngdoc function
		 * @name pascalprecht.translate.$translateProvider#translationNotFoundIndicatorLeft
		 * @methodOf pascalprecht.translate.$translateProvider
		 *
		 * @description
		 * Sets an indicator which is used when a translation isn't found right to the
		 * translation id.
		 *
		 * @param {string} indicator An indicator.
		 */
		this.translationNotFoundIndicatorRight = function(indicator) {
			if (!indicator) {
				return $notFoundIndicatorRight;
			}
			$notFoundIndicatorRight = indicator;
			return this;
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
				if (!$translationTable[langKey] && (!$loaderFactory)) {
					// only throw an error, when not loading translation data asynchronously
					throw new Error("$translateProvider couldn't find translationTable for langKey: '" + langKey + "'");
				}
				$uses = langKey;
				return this;
			}
			return $uses;
		};

		/**
		 * @ngdoc function
		 * @name pascalprecht.translate.$translateProvider#storageKey
		 * @methodOf pascalprecht.translate.$translateProvider
		 *
		 * @description
		 * Tells the module which key must represent the choosed language by a user in the storage.
		 *
		 * @param {string} key A key for the storage.
		 */
		var storageKey = function(key) {
			if (!key) {
				if ($storagePrefix) {
					return $storagePrefix + $storageKey;
				}
				return $storageKey;
			}
			$storageKey = key;
		};

		this.storageKey = storageKey;

		/**
		 * @ngdoc function
		 * @name pascalprecht.translate.$translateProvider#useUrlLoader
		 * @methodOf pascalprecht.translate.$translateProvider
		 *
		 * @description
		 * Tells angular-translate to use `$translateUrlLoader` extension service as loader.
		 *
		 * @param {string} url Url
		 */
		this.useUrlLoader = function(url) {
			return this.useLoader('$translateUrlLoader', {
				url: url
			});
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
		 * @name pascalprecht.translate.$translateProvider#useLocalStorage
		 * @methodOf pascalprecht.translate.$translateProvider
		 *
		 * @description
		 * Tells angular-translate to use `$translateLocalStorage` service as storage layer.
		 *
		 */
		this.useLocalStorage = function() {
			return this.useStorage('$translateLocalStorage');
		};

		/**
		 * @ngdoc function
		 * @name pascalprecht.translate.$translateProvider#useCookieStorage
		 * @methodOf pascalprecht.translate.$translateProvider
		 *
		 * @description
		 * Tells angular-translate to use `$translateCookieStorage` service as storage layer.
		 */
		this.useCookieStorage = function() {
			return this.useStorage('$translateCookieStorage');
		};

		/**
		 * @ngdoc function
		 * @name pascalprecht.translate.$translateProvider#useStorage
		 * @methodOf pascalprecht.translate.$translateProvider
		 *
		 * @description
		 * Tells angular-translate to use custom service as storage layer.
		 */
		this.useStorage = function(storageFactory) {
			$storageFactory = storageFactory;
			return this;
		};

		/**
		 * @ngdoc function
		 * @name pascalprecht.translate.$translateProvider#storagePrefix
		 * @methodOf pascalprecht.translate.$translateProvider
		 *
		 * @description
		 * Sets prefix for storage key.
		 *
		 * @param {string} prefix Storage key prefix
		 */
		this.storagePrefix = function(prefix) {
			if (!prefix) {
				return prefix;
			}
			$storagePrefix = prefix;
			return this;
		};

		/**
		 * @ngdoc function
		 * @name pascalprecht.translate.$translateProvider#useMissingTranslationHandlerLog
		 * @methodOf pascalprecht.translate.$translateProvider
		 *
		 * @description
		 * Tells angular-translate to use built-in log handler when trying to translate
		 * a translation Id which doesn't exist.
		 *
		 * This is actually a shortcut method for `useMissingTranslationHandler()`.
		 *
		 */
		this.useMissingTranslationHandlerLog = function() {
			return this.useMissingTranslationHandler('$translateMissingTranslationHandlerLog');
		};

		/**
		 * @ngdoc function
		 * @name pascalprecht.translate.$translateProvider#useMissingTranslationHandler
		 * @methodOf pascalprecht.translate.$translateProvider
		 *
		 * @description
		 * Expects a factory name which later gets instantiated with `$injector`.
		 * This method can be used to tell angular-translate to use a custom
		 * missingTranslationHandler. Just build a factory which returns a function
		 * and expects a translation id as argument.
		 *
		 * Example:
		 * <pre>
		 *  app.config(function ($translateProvider) {
		 *    $translateProvider.useMissingTranslationHandler('customHandler');
		 *  });
		 *
		 *  app.factory('customHandler', function (dep1, dep2) {
		 *    return function (translationId) {
		 *      // something with translationId and dep1 and dep2
		 *    };
		 *  });
		 * </pre>
		 *
		 * @param {string} factory Factory name
		 */
		this.useMissingTranslationHandler = function(factory) {
			$missingTranslationHandlerFactory = factory;
			return this;
		};

		/**
		 * @ngdoc function
		 * @name pascalprecht.translate.$translateProvider#usePostCompiling
		 * @methodOf pascalprecht.translate.$translateProvider
		 *
		 * @description
		 * If post compiling is enabled, all translated values will be processed
		 * again with AngularJS' $compile.
		 *
		 * Example:
		 * <pre>
		 *  app.config(function ($translateProvider) {
		 *    $translateProvider.usePostCompiling(true);
		 *  });
		 * </pre>
		 *
		 * @param {string} factory Factory name
		 */
		this.usePostCompiling = function(value) {
			$postCompilingEnabled = !(!value);
			return this;
		};

		/**
		 * @ngdoc function
		 * @name pascalprecht.translate.$translateProvider#determinePreferredLanguage
		 * @methodOf pascalprecht.translate.$translateProvider
		 *
		 * @description
		 * Tells angular-translate to try to determine on its own which language key
		 * to set as preferred language. When `fn` is given, angular-translate uses it
		 * to determine a language key, otherwise it uses the built-in `getLocale()`
		 * method.
		 *
		 * The `getLocale()` returns a language key in the format `[lang]_[country]` or
		 * `[lang]` depending on what the browser provides.
		 *
		 * Use this method at your own risk, since not all browsers return a valid
		 * locale.
		 *
		 * @param {object=} fn Function to determine a browser's locale
		 */
		this.determinePreferredLanguage = function(fn) {

			var locale = (fn && angular.isFunction(fn)) ? fn() : getLocale();

			if (!$availableLanguageKeys.length) {
				$preferredLanguage = locale;
				return this;
			} else {
				$preferredLanguage = negotiateLocale(locale);
			}
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
			'$q',
			function($log, $injector, $rootScope, $q) {

				var Storage,
					defaultInterpolator = $injector.get($interpolationFactory || '$translateDefaultInterpolation'),
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

						if ($storageFactory && !promise) {
							// looks like there's no pending promise for $preferredLanguage or
							// $uses. Maybe there's one pending for a language that comes from
							// storage.
							var langKey = Storage.get($storageKey);
							promise = langPromises[langKey];

						}
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

					if ($storageFactory) {
						Storage.set($translate.storageKey(), $uses);
					}
					// inform default interpolator
					defaultInterpolator.setLocale($uses);
					// inform all others to!
					angular.forEach(interpolatorHashMap, function(interpolator, id) {
						interpolatorHashMap[id].setLocale($uses);
					});
					$rootScope.$emit('$translateChangeEnd');
				};

				/**
				 * @name loadAsync
				 * @private
				 *
				 * @description
				 * Kicks of registered async loader using `$injector` and applies existing
				 * loader options. When resolved, it updates translation tables accordingly
				 * or rejects with given language key.
				 *
				 * @param {string} key Language key.
				 * @return {Promise} A promise.
				 */
				var loadAsync = function(key) {
					if (!key) {
						throw 'No language key specified for loading.';
					}

					var deferred = $q.defer();

					$rootScope.$emit('$translateLoadingStart');
					pendingLoader = true;

					$injector.get($loaderFactory)(angular.extend($loaderOptions, {
						key: key
					})).then(function(data) {
						var translationTable = {};
						$rootScope.$emit('$translateLoadingSuccess');

						if (angular.isArray(data)) {
							angular.forEach(data, function(table) {
								angular.extend(translationTable, flatObject(table));
							});
						} else {
							angular.extend(translationTable, flatObject(data));
						}
						pendingLoader = false;
						deferred.resolve({
							key: key,
							table: translationTable
						});
						$rootScope.$emit('$translateLoadingEnd');
					}, function(key) {
						$rootScope.$emit('$translateLoadingError');
						deferred.reject(key);
						$rootScope.$emit('$translateLoadingEnd');
					});
					return deferred.promise;
				};

				if ($storageFactory) {
					Storage = $injector.get($storageFactory);

					if (!Storage.get || !Storage.set) {
						throw new Error('Couldn\'t use storage \'' + $storageFactory + '\', missing get() or set() method!');
					}
				}

				// apply additional settings
				if (angular.isFunction(defaultInterpolator.useSanitizeValueStrategy)) {
					defaultInterpolator.useSanitizeValueStrategy($interpolationSanitizationStrategy);
				}

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
				 * @name pascalprecht.translate.$translate#cloakClassName
				 * @methodOf pascalprecht.translate.$translate
				 *
				 * @description
				 * Returns the configured class name for `translate-cloak` directive.
				 *
				 * @return {string} cloakClassName
				 */
				$translate.cloakClassName = function() {
					return $cloakClassName;
				};

				/**
				 * @ngdoc function
				 * @name pascalprecht.translate.$translate#proposedLanguage
				 * @methodOf pascalprecht.translate.$translate
				 *
				 * @description
				 * Returns the language key of language that is currently loaded asynchronously.
				 *
				 * @return {string} language key
				 */
				$translate.proposedLanguage = function() {
					return $nextLang;
				};

				/**
				 * @ngdoc function
				 * @name pascalprecht.translate.$translate#storage
				 * @methodOf pascalprecht.translate.$translate
				 *
				 * @description
				 * Returns registered storage.
				 *
				 * @return {object} Storage
				 */
				$translate.storage = function() {
					return Storage;
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

					var deferred = $q.defer();

					$rootScope.$emit('$translateChangeStart');

					// if there isn't a translation table for the language we've requested,
					// we load it asynchronously
					if (!$translationTable[key] && $loaderFactory) {
						$nextLang = key;
						langPromises[key] = loadAsync(key).then(function(translation) {
							$nextLang = undefined;
							translations(translation.key, translation.table);
							deferred.resolve(translation.key);
							useLanguage(translation.key);
						}, function(key) {
							$nextLang = undefined;
							$rootScope.$emit('$translateChangeError');
							deferred.reject(key);
							$rootScope.$emit('$translateChangeEnd');
						});
					} else {
						deferred.resolve(key);
						useLanguage(key);
					}

					return deferred.promise;
				};

				/**
				 * @ngdoc function
				 * @name pascalprecht.translate.$translate#storageKey
				 * @methodOf pascalprecht.translate.$translate
				 *
				 * @description
				 * Returns the key for the storage.
				 *
				 * @return {string} storage key
				 */
				$translate.storageKey = function() {
					return storageKey();
				};

				/**
				 * @ngdoc function
				 * @name pascalprecht.translate.$translate#isPostCompilingEnabled
				 * @methodOf pascalprecht.translate.$translate
				 *
				 * @description
				 * Returns whether post compiling is enabled or not
				 *
				 * @return {bool} storage key
				 */
				$translate.isPostCompilingEnabled = function() {
					return $postCompilingEnabled;
				};

				/**
				 * @ngdoc function
				 * @name pascalprecht.translate.$translate#refresh
				 * @methodOf pascalprecht.translate.$translate
				 *
				 * @description
				 * Refreshes a translation table pointed by the given langKey. If langKey is not specified,
				 * the module will drop all existent translation tables and load new version of those which
				 * are currently in use.
				 *
				 * Refresh means that the module will drop target translation table and try to load it again.
				 *
				 * In case there are no loaders registered the refresh() method will throw an Error.
				 *
				 * If the module is able to refresh translation tables refresh() method will broadcast
				 * $translateRefreshStart and $translateRefreshEnd events.
				 *
				 * @example
				 * // this will drop all currently existent translation tables and reload those which are
				 * // currently in use
				 * $translate.refresh();
				 * // this will refresh a translation table for the en_US language
				 * $translate.refresh('en_US');
				 *
				 * @param {string} langKey A language key of the table, which has to be refreshed
				 *
				 * @return {promise} Promise, which will be resolved in case a translation tables refreshing
				 * process is finished successfully, and reject if not.
				 */
				$translate.refresh = function(langKey) {
					if (!$loaderFactory) {
						throw new Error('Couldn\'t refresh translation table, no loader registered!');
					}

					var deferred = $q.defer();

					function resolve() {
						deferred.resolve();
						$rootScope.$emit('$translateRefreshEnd');
					}

					function reject() {
						deferred.reject();
						$rootScope.$emit('$translateRefreshEnd');
					}

					$rootScope.$emit('$translateRefreshStart');

					if (!langKey) {
						// if there's no language key specified we refresh ALL THE THINGS!
						var tables = [];

						// reload currently used language
						if ($uses) {
							tables.push(loadAsync($uses));
						}

						$q.all(tables).then(function(tableData) {
							angular.forEach(tableData, function(data) {
								if ($translationTable[data.key]) {
									delete $translationTable[data.key];
								}
								translations(data.key, data.table);
							});
							resolve();
						});

					} else if ($translationTable[langKey]) {

						loadAsync(langKey).then(function(data) {
							translations(data.key, data.table);
							if (langKey === $uses) {
								useLanguage($uses);
							}
							resolve();
						}, reject);

					} else {
						reject();
					}
					return deferred.promise;
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

				if ($loaderFactory) {

					// If at least one async loader is defined and there are no
					// (default) translations available we should try to load them.
					if (angular.equals($translationTable, {})) {
						$translate.use($translate.use());
					}

				}

				return $translate;
			}
		];


	}
]);

ngTranslate
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
        'use strict';

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

ngTranslate
.constant('$STORAGE_KEY', 'NG_TRANSLATE_LANG_KEY');

angular.module('pascalprecht.translate')
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
.filter('translate', ['$parse', '$translate', function ($parse, $translate) {
  return function (translationId, interpolateParams, interpolation) {

    if (!angular.isObject(interpolateParams)) {
      interpolateParams = $parse(interpolateParams)();
    }

    return $translate.instant(translationId, interpolateParams, interpolation);
  };
}]);

/*jshint -W087 */
ngTranslate
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
.directive('translate', ['$translate', '$q', '$interpolate', '$compile', '$parse', '$rootScope',
	function($translate, $q, $interpolate, $compile, $parse, $rootScope) {
		'use strict';

		return {
			restrict: 'AE',
			scope: true,
			link: function(scope, iElement, iAttr) {
				var translateValuesExist = (iAttr.translateValues) ? iAttr.translateValues : undefined,
					translateInterpolation = (iAttr.translateInterpolation) ? iAttr.translateInterpolation : undefined,
					translateValueExist = iElement[0].outerHTML.match(/translate-value-+/i),
					fallbackValue = iElement.html();

				scope.fallbackValue = fallbackValue;
				scope.interpolateParams = {};

				// Ensures any change of the attribute "translate" containing the id will
				// be re-stored to the scope's "translationId".
				// If the attribute has no content, the element's text value (white spaces trimmed off) will be used.
				iAttr.$observe('translate', function(translationId) {
					if (angular.equals(translationId, '') || !angular.isDefined(translationId)) {
						scope.translationId = $interpolate(iElement.text().replace(/^\s+|\s+$/g, ''))(scope.$parent);
					} else {
						scope.translationId = translationId;
					}
				});


				if (translateValuesExist) {
					iAttr.$observe('translateValues', function(interpolateParams) {
						if (interpolateParams) {
							scope.$parent.$watch(function() {
								angular.extend(scope.interpolateParams, $parse(interpolateParams)(scope.$parent));
							});
						}
					});
				}

				if (translateValueExist) {
					var fn = function(attrName) {
						iAttr.$observe(attrName, function(value) {
							scope.interpolateParams[angular.lowercase(attrName.substr(14))] = value;
						});
					};
					for (var attr in iAttr) {
						if (iAttr.hasOwnProperty(attr) && attr.substr(0, 14) === 'translateValue' && attr !== 'translateValues') {
							fn(attr);
						}
					}
				}

				var applyElementContent = function(value, scope) {
					var globallyEnabled = $translate.isPostCompilingEnabled(),
						locallyDefined = (typeof iAttr.translateCompile !== 'undefined'),
						locallyEnabled = (locallyDefined && iAttr.translateCompile !== 'false');

					iElement.html(value);

					if (!locallyDefined || locallyEnabled) {
						$compile(iElement.contents())(scope);
					}

				};

				var updateTranslationFn = (function() {
					if (!translateValuesExist && !translateValueExist) {
						return function() {
							var unwatch = scope.$watch('translationId', function(value) {
								if (scope.translationId && value) {
									$translate(value, {}, translateInterpolation)
										.then(function(translation) {
											applyElementContent(translation, scope);
											unwatch();
										}, function(error) {
											applyElementContent(scope.fallbackValue, scope);
											scope.$emit('Translation Error', error);
											unwatch();
										});
								}
							}, true);
						};
					} else {
						return function() {
							scope.$watch('interpolateParams', function(value) {
								if (scope.translationId && value) {
									$translate(scope.translationId, value, translateInterpolation)
										.then(function(translation) {
											applyElementContent(translation, scope);
										}, function(error) {
											applyElementContent(scope.fallbackValue, scope);
											scope.$emit('Translation Error', error);
										});
								}
							}, true);
						};
					}
				}());
				// Ensures the text will be refreshed after the current language was changed
				// w/ $translate.use(...)
				var unbind = $rootScope.$on('$translateChangeSuccess', updateTranslationFn);

				updateTranslationFn();
				scope.$on('$destroy', unbind);
			}
		};

	}
]);

ngTranslate
/**
 * @ngdoc directive
 * @name pascalprecht.translate.directive:translateCloak
 * @requires $rootScope
 * @requires $translate
 * @restrict A
 *
 * $description
 * Adds a `translate-cloak` class name to the given element where this directive
 * is applied initially and removes it, once a loader has finished loading.
 *
 * This directive can be used to prevent initial flickering when loading translation
 * data asynchronously.
 *
 * @param {string=} translate-cloak No string required
 */
.directive('translateCloak', ['$rootScope', '$translate',
	function($rootScope, $translate) {
		'use strict';
		return {
			compile: function(tElement) {
				$rootScope.$on('$translateLoadingSuccess', function() {
					tElement.removeClass($translate.cloakClassName());
				});
				tElement.addClass($translate.cloakClassName());
			}
		};
	}
]);
