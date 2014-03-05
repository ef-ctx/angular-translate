(function () {
  'use strict';
  var ngTranslate = angular.module('pascalprecht.translate', ['ng']);
  ngTranslate.value('ngTranslateConfig', {
    'languageLabels': {
      'en_US': 'English (United States)',
      'en_GB': 'English (Great Britain)',
      'es_ES': 'Espa\xf1ol (Espa\xf1a)',
      'fr_FR': 'Fran\xe7ais',
      'pt_PT': 'Portugu\xeas'
    }
  });
  ngTranslate.constant('$STORAGE_KEY', 'NG_TRANSLATE_LANG_KEY');
  ngTranslate.factory('$translateDefaultInterpolation', [
    '$interpolate',
    function ($interpolate) {
      var $translateInterpolator = {}, $locale, $identifier = 'default', $sanitizeValueStrategy = null, sanitizeValueStrategies = {
          escaped: function (params) {
            var result = {};
            for (var key in params) {
              if (params.hasOwnProperty(key)) {
                result[key] = angular.element('<div></div>').text(params[key]).html();
              }
            }
            return result;
          }
        };
      var sanitizeParams = function (params) {
        var result;
        if (angular.isFunction(sanitizeValueStrategies[$sanitizeValueStrategy])) {
          result = sanitizeValueStrategies[$sanitizeValueStrategy](params);
        } else {
          result = params;
        }
        return result;
      };
      $translateInterpolator.setLocale = function (locale) {
        $locale = locale;
      };
      $translateInterpolator.getInterpolationIdentifier = function () {
        return $identifier;
      };
      $translateInterpolator.useSanitizeValueStrategy = function (value) {
        $sanitizeValueStrategy = value;
        return this;
      };
      $translateInterpolator.interpolate = function (string, interpolateParams) {
        if ($sanitizeValueStrategy) {
          interpolateParams = sanitizeParams(interpolateParams);
        }
        return $interpolate(string)(interpolateParams);
      };
      return $translateInterpolator;
    }
  ]);
  ngTranslate.provider('$translate', [
    '$STORAGE_KEY',
    function ($STORAGE_KEY) {
      var $translationTable = {}, $preferredLanguage, $availableLanguageKeys = [], $languageKeyAliases, $uses, $nextLang, $storageFactory, $storageKey = $STORAGE_KEY, $storagePrefix, $missingTranslationHandlerFactory, $interpolationFactory, $interpolatorFactories = [], $interpolationSanitizationStrategy = false, $loaderFactory, $cloakClassName = 'translate-cloak', $loaderOptions, $notFoundIndicatorLeft, $notFoundIndicatorRight, $postCompilingEnabled = false, $linkKeyRegExp = /@\:\((.*?)?\)/g, NESTED_OBJECT_DELIMITER = '.';
      var getLocale = function () {
        var nav = window.navigator;
        return (nav.language || nav.browserLanguage || nav.systemLanguage || nav.userLanguage || '').split('-').join('_');
      };
      var negotiateLocale = function (preferred) {
        var avail = [], locale = angular.lowercase(preferred), i = 0, n = $availableLanguageKeys.length;
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
      var translations = function (langKey, translationTable) {
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
      this.cloakClassName = function (name) {
        if (!name) {
          return $cloakClassName;
        }
        $cloakClassName = name;
        return this;
      };
      var flatObject = function (data, path, result, prevKey) {
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
            keyWithPath = path.length ? '' + path.join(NESTED_OBJECT_DELIMITER) + NESTED_OBJECT_DELIMITER + key : key;
            if (path.length && key === prevKey) {
              keyWithShortPath = '' + path.join(NESTED_OBJECT_DELIMITER);
              result[keyWithShortPath] = '@:' + keyWithPath;
            }
            result[keyWithPath] = val;
          }
        }
        return result;
      };
      this.addInterpolation = function (factory) {
        $interpolatorFactories.push(factory);
        return this;
      };
      this.useMessageFormatInterpolation = function () {
        return this.useInterpolation('$translateMessageFormatInterpolation');
      };
      this.useInterpolation = function (factory) {
        $interpolationFactory = factory;
        return this;
      };
      this.useSanitizeValueStrategy = function (value) {
        $interpolationSanitizationStrategy = value;
        return this;
      };
      this.preferredLanguage = function (langKey) {
        if (langKey) {
          $preferredLanguage = langKey;
          return this;
        }
        return $preferredLanguage;
      };
      this.translationNotFoundIndicator = function (indicator) {
        this.translationNotFoundIndicatorLeft(indicator);
        this.translationNotFoundIndicatorRight(indicator);
        return this;
      };
      this.translationNotFoundIndicatorLeft = function (indicator) {
        if (!indicator) {
          return $notFoundIndicatorLeft;
        }
        $notFoundIndicatorLeft = indicator;
        return this;
      };
      this.translationNotFoundIndicatorRight = function (indicator) {
        if (!indicator) {
          return $notFoundIndicatorRight;
        }
        $notFoundIndicatorRight = indicator;
        return this;
      };
      this.use = function (langKey) {
        if (langKey) {
          if (!$translationTable[langKey] && !$loaderFactory) {
            throw new Error('$translateProvider couldn\'t find translationTable for langKey: \'' + langKey + '\'');
          }
          $uses = langKey;
          return this;
        }
        return $uses;
      };
      var storageKey = function (key) {
        if (!key) {
          if ($storagePrefix) {
            return $storagePrefix + $storageKey;
          }
          return $storageKey;
        }
        $storageKey = key;
      };
      this.storageKey = storageKey;
      this.useUrlLoader = function (url) {
        return this.useLoader('$translateUrlLoader', { url: url });
      };
      this.useStaticFilesLoader = function (options) {
        return this.useLoader('$translateStaticFilesLoader', options);
      };
      this.useLoader = function (loaderFactory, options) {
        $loaderFactory = loaderFactory;
        $loaderOptions = options || {};
        return this;
      };
      this.useLocalStorage = function () {
        return this.useStorage('$translateLocalStorage');
      };
      this.useCookieStorage = function () {
        return this.useStorage('$translateCookieStorage');
      };
      this.useStorage = function (storageFactory) {
        $storageFactory = storageFactory;
        return this;
      };
      this.storagePrefix = function (prefix) {
        if (!prefix) {
          return prefix;
        }
        $storagePrefix = prefix;
        return this;
      };
      this.useMissingTranslationHandlerLog = function () {
        return this.useMissingTranslationHandler('$translateMissingTranslationHandlerLog');
      };
      this.useMissingTranslationHandler = function (factory) {
        $missingTranslationHandlerFactory = factory;
        return this;
      };
      this.usePostCompiling = function (value) {
        $postCompilingEnabled = !!value;
        return this;
      };
      this.determinePreferredLanguage = function (fn) {
        var locale = fn && angular.isFunction(fn) ? fn() : getLocale();
        if (!$availableLanguageKeys.length) {
          $preferredLanguage = locale;
          return this;
        } else {
          $preferredLanguage = negotiateLocale(locale);
        }
      };
      this.registerAvailableLanguageKeys = function (languageKeys, aliases) {
        if (languageKeys) {
          $availableLanguageKeys = languageKeys;
          if (aliases) {
            $languageKeyAliases = aliases;
          }
          return this;
        }
        return $availableLanguageKeys;
      };
      this.linkKeyRegExp = function (exp) {
        if (exp) {
          $linkKeyRegExp = exp;
          return this;
        }
        return $linkKeyRegExp;
      };
      this.$get = [
        '$log',
        '$injector',
        '$rootScope',
        '$q',
        function ($log, $injector, $rootScope, $q) {
          var Storage, defaultInterpolator = $injector.get($interpolationFactory || '$translateDefaultInterpolation'), pendingLoader = false, interpolatorHashMap = {}, langPromises = {};
          var $translate = function (translationId, interpolateParams, interpolationId) {
            var deferred = $q.defer();
            translationId = translationId.trim();
            var promiseToWaitFor = function () {
                var promise = $preferredLanguage ? langPromises[$preferredLanguage] : langPromises[$uses];
                if ($storageFactory && !promise) {
                  var langKey = Storage.get($storageKey);
                  promise = langPromises[langKey];
                }
                return promise;
              }();
            if (!promiseToWaitFor) {
              determineTranslation(translationId, interpolateParams, interpolationId).then(deferred.resolve, deferred.reject);
            } else {
              promiseToWaitFor.then(function () {
                determineTranslation(translationId, interpolateParams, interpolationId).then(deferred.resolve, deferred.reject);
              });
            }
            return deferred.promise;
          };
          var useLanguage = function (key) {
            $uses = key;
            $rootScope.$emit('$translateChangeSuccess');
            if ($storageFactory) {
              Storage.set($translate.storageKey(), $uses);
            }
            defaultInterpolator.setLocale($uses);
            angular.forEach(interpolatorHashMap, function (interpolator, id) {
              interpolatorHashMap[id].setLocale($uses);
            });
            $rootScope.$emit('$translateChangeEnd');
          };
          var loadAsync = function (key) {
            if (!key) {
              throw 'No language key specified for loading.';
            }
            var deferred = $q.defer();
            $rootScope.$emit('$translateLoadingStart');
            pendingLoader = true;
            $injector.get($loaderFactory)(angular.extend($loaderOptions, { key: key })).then(function (data) {
              var translationTable = {};
              $rootScope.$emit('$translateLoadingSuccess');
              if (angular.isArray(data)) {
                angular.forEach(data, function (table) {
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
            }, function (key) {
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
          if (angular.isFunction(defaultInterpolator.useSanitizeValueStrategy)) {
            defaultInterpolator.useSanitizeValueStrategy($interpolationSanitizationStrategy);
          }
          if ($interpolatorFactories.length) {
            angular.forEach($interpolatorFactories, function (interpolatorFactory) {
              var interpolator = $injector.get(interpolatorFactory);
              interpolator.setLocale($preferredLanguage || $uses);
              if (angular.isFunction(interpolator.useSanitizeValueStrategy)) {
                interpolator.useSanitizeValueStrategy($interpolationSanitizationStrategy);
              }
              interpolatorHashMap[interpolator.getInterpolationIdentifier()] = interpolator;
            });
          }
          var translateKey = function (key, translationTable) {
            var value = translationTable.hasOwnProperty(key) ? translationTable[key] : undefined;
            if (value !== undefined) {
              if (value.match($linkKeyRegExp) && value.match($linkKeyRegExp).length > 0) {
                return value.replace($linkKeyRegExp, function (str, p1) {
                  return translateKey(p1, translationTable);
                });
              } else {
                return value;
              }
            } else {
              throw new Error('translation error : ' + key + ' key not found error');
            }
          };
          var determineTranslation = function (translationId, interpolateParams, interpolationId) {
            var deferred = $q.defer(), table = $uses ? $translationTable[$uses] : $translationTable, Interpolator = interpolationId ? interpolatorHashMap[interpolationId] : defaultInterpolator;
            try {
              deferred.resolve(Interpolator.interpolate(translateKey(translationId, table), interpolateParams));
            } catch (error) {
              deferred.reject(error);
            }
            return deferred.promise;
          };
          var determineTranslationInstant = function (translationId, interpolateParams, interpolationId) {
            var result, table = $uses ? $translationTable[$uses] : $translationTable, Interpolator = interpolationId ? interpolatorHashMap[interpolationId] : defaultInterpolator;
            try {
              result = Interpolator.interpolate(translateKey(translationId, table), interpolateParams);
            } catch (error) {
              console.error(error);
            }
            return result;
          };
          $translate.preferredLanguage = function () {
            return $preferredLanguage;
          };
          $translate.cloakClassName = function () {
            return $cloakClassName;
          };
          $translate.proposedLanguage = function () {
            return $nextLang;
          };
          $translate.storage = function () {
            return Storage;
          };
          $translate.use = function (key) {
            if (!key) {
              return $uses;
            }
            var deferred = $q.defer();
            $rootScope.$emit('$translateChangeStart');
            if (!$translationTable[key] && $loaderFactory) {
              $nextLang = key;
              langPromises[key] = loadAsync(key).then(function (translation) {
                $nextLang = undefined;
                translations(translation.key, translation.table);
                deferred.resolve(translation.key);
                useLanguage(translation.key);
              }, function (key) {
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
          $translate.storageKey = function () {
            return storageKey();
          };
          $translate.isPostCompilingEnabled = function () {
            return $postCompilingEnabled;
          };
          $translate.refresh = function (langKey) {
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
              var tables = [];
              if ($uses) {
                tables.push(loadAsync($uses));
              }
              $q.all(tables).then(function (tableData) {
                angular.forEach(tableData, function (data) {
                  if ($translationTable[data.key]) {
                    delete $translationTable[data.key];
                  }
                  translations(data.key, data.table);
                });
                resolve();
              });
            } else if ($translationTable[langKey]) {
              loadAsync(langKey).then(function (data) {
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
          $translate.instant = function (translationId, interpolateParams, interpolationId) {
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
              result = undefined;
              if ($missingTranslationHandlerFactory && !pendingLoader) {
                $injector.get($missingTranslationHandlerFactory)(translationId, $uses);
              }
            }
            return result;
          };
          if ($loaderFactory) {
            if (angular.equals($translationTable, {})) {
              $translate.use($translate.use());
            }
          }
          return $translate;
        }
      ];
    }
  ]);
  ngTranslate.factory('$translateStaticFilesLoader', [
    '$q',
    '$http',
    function ($q, $http) {
      return function (options) {
        if (!options || (!angular.isString(options.prefix) || !angular.isString(options.suffix))) {
          throw new Error('Couldn\'t load static files, no prefix or suffix specified!');
        }
        var deferred = $q.defer();
        $http({
          url: [
            options.prefix,
            options.key,
            options.suffix
          ].join(''),
          method: 'GET',
          params: ''
        }).success(function (data) {
          deferred.resolve(data);
        }).error(function () {
          deferred.reject(options.key);
        });
        return deferred.promise;
      };
    }
  ]);
  angular.module('pascalprecht.translate').filter('translate', [
    '$parse',
    '$translate',
    function ($parse, $translate) {
      return function (translationId, interpolateParams, interpolation) {
        if (!angular.isObject(interpolateParams)) {
          interpolateParams = $parse(interpolateParams)();
        }
        return $translate.instant(translationId, interpolateParams, interpolation);
      };
    }
  ]);
  ngTranslate.directive('translate', [
    '$translate',
    '$q',
    '$interpolate',
    '$compile',
    '$parse',
    '$rootScope',
    function ($translate, $q, $interpolate, $compile, $parse, $rootScope) {
      return {
        restrict: 'AE',
        scope: true,
        link: function (scope, iElement, iAttr) {
          var translateValuesExist = iAttr.translateValues ? iAttr.translateValues : undefined, translateInterpolation = iAttr.translateInterpolation ? iAttr.translateInterpolation : undefined, translateValueExist = iElement[0].outerHTML.match(/translate-value-+/i), prefix = iElement.attr('data-prefix') ? iElement.attr('data-prefix') : undefined, suffix = iElement.attr('data-suffix') ? iElement.attr('data-suffix') : undefined, fallbackValue = iElement.html();
          scope.fallbackValue = fallbackValue;
          scope.interpolateParams = {};
          iAttr.$observe('translate', function (translationId) {
            if (angular.equals(translationId, '') || !angular.isDefined(translationId)) {
              scope.translationId = $interpolate(iElement.text().replace(/^\s+|\s+$/g, ''))(scope.$parent);
            } else {
              scope.translationId = translationId;
            }
          });
          if (translateValuesExist) {
            iAttr.$observe('translateValues', function (interpolateParams) {
              if (interpolateParams) {
                scope.$parent.$watch(function () {
                  angular.extend(scope.interpolateParams, $parse(interpolateParams)(scope.$parent));
                });
              }
            });
          }
          if (translateValueExist) {
            var fn = function (attrName) {
              iAttr.$observe(attrName, function (value) {
                scope.interpolateParams[angular.lowercase(attrName.substr(14))] = value;
              });
            };
            for (var attr in iAttr) {
              if (iAttr.hasOwnProperty(attr) && attr.substr(0, 14) === 'translateValue' && attr !== 'translateValues') {
                fn(attr);
              }
            }
          }
          var applyElementContent = function (value, scope) {
            var globallyEnabled = $translate.isPostCompilingEnabled(), locallyDefined = typeof iAttr.translateCompile !== 'undefined', locallyEnabled = locallyDefined && iAttr.translateCompile !== 'false';
            value = prefix ? prefix + value : value;
            value = suffix ? value + suffix : value;
            iElement.html(value);
            if (!locallyDefined || locallyEnabled) {
              $compile(iElement.contents())(scope);
            }
          };
          var updateTranslationFn = function () {
              if (!translateValuesExist && !translateValueExist) {
                return function () {
                  var unwatch = scope.$watch('translationId', function (value) {
                      if (scope.translationId && value) {
                        $translate(value, {}, translateInterpolation).then(function (translation) {
                          applyElementContent(translation, scope);
                          unwatch();
                        }, function (error) {
                          applyElementContent(scope.fallbackValue, scope);
                          scope.$emit('Translation Error', error);
                          unwatch();
                        });
                      }
                    }, true);
                };
              } else {
                return function () {
                  scope.$watch('interpolateParams', function (value) {
                    if (scope.translationId && value) {
                      $translate(scope.translationId, value, translateInterpolation).then(function (translation) {
                        applyElementContent(translation, scope);
                      }, function (error) {
                        applyElementContent(scope.fallbackValue, scope);
                        scope.$emit('Translation Error', error);
                      });
                    }
                  }, true);
                };
              }
            }();
          var unbind = $rootScope.$on('$translateChangeSuccess', updateTranslationFn);
          updateTranslationFn();
          scope.$on('$destroy', unbind);
        }
      };
    }
  ]);
  ngTranslate.directive('localeSelector', [
    '$translate',
    'ngTranslateConfig',
    function ($translate, config) {
      var changeLocaleHandler = function (locale) {
          $translate.use(locale);
        }, linkFn = function (scope) {
          scope.config = config;
          scope.changeLocale = changeLocaleHandler;
        };
      return {
        restrict: 'AE',
        templateUrl: 'templates/localeSelector.tpl.html',
        transclude: true,
        replace: true,
        scope: {
          languages: '=',
          selectorLabel: '@',
          selectorLabelL10n: '@',
          translate: '@'
        },
        priority: 1,
        link: linkFn
      };
    }
  ]);
  ngTranslate.directive('translateCloak', [
    '$rootScope',
    '$translate',
    function ($rootScope, $translate) {
      return {
        compile: function (tElement) {
          $rootScope.$on('$translateLoadingSuccess', function () {
            tElement.removeClass($translate.cloakClassName());
          });
          tElement.addClass($translate.cloakClassName());
        }
      };
    }
  ]);
  ngTranslate.run([
    '$translate',
    function ($translate) {
      var key = $translate.storageKey(), storage = $translate.storage();
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
  ngTranslate.run([
    '$templateCache',
    function ($templateCache) {
      $templateCache.put('templates/localeSelector.tpl.html', '<div class="localeSelector btn-group"><button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown"><span ng-transclude=""></span> <span class="caret"></span></button><ul class="dropdown-menu" role="menu"><li data-ng-repeat="locale in languages"><a href="#" class="locale-{{ locale }}" data-translate="{{ \'localeSelector.\' + locale }}" ng-click="changeLocale(locale)">{{ config.languageLabels[locale] || locale }}</a></li></ul></div>');
    }
  ]);
}());