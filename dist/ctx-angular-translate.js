(function () {
  'use strict';
  var cxTranslate = angular.module('pascalprecht.translate', ['ng']);
  cxTranslate.factory('$translateDefaultInterpolation', [
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
  cxTranslate.factory('fileLoader', [
    '$q',
    '$http',
    function ($q, $http) {
      return function (fileConfiguration) {
        var defer = $q.defer(), prefix = fileConfiguration.prefix || '', suffix = fileConfiguration.suffix || '', params = {
            url: prefix + fileConfiguration.name + suffix,
            method: 'GET',
            params: ''
          };
        $http(params).then(function (response) {
          defer.resolve(response.data);
        }, function (error) {
          defer.reject(error);
        });
        return defer.promise;
      };
    }
  ]);
  cxTranslate.provider('$translate', [function () {
      var translationTable = {}, config = { linkKeyRegExp: /@\:\((.*?)?\)/g }, NESTED_OBJECT_DELIMITER = '.';
      var translations = function (data) {
        if (data) {
          translationTable = angular.extend(translationTable, flatObject(data));
        }
        return translationTable;
      };
      this.translations = translations;
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
      var setLocale = function setLocale(locale) {
        if (locale) {
          config.locale = locale;
        }
        return locale;
      };
      this.setLocale = setLocale;
      this.setLanguage = setLocale;
      this.preferredLanguage = setLocale;
      this.configure = function configure(data) {
        angular.extend(config, data);
      };
      this.linkKeyRegExp = function (exp) {
        if (exp) {
          config.linkKeyRegExp = exp;
          return this;
        }
        return config.linkKeyRegExp;
      };
      var translateKey = function (key) {
        var value = translationTable.hasOwnProperty(key) ? translationTable[key] : undefined, keyRE = config.linkKeyRegExp;
        if (value !== undefined) {
          if (value.match(keyRE) && value.match(keyRE).length > 0) {
            return value.replace(keyRE, function (str, p1) {
              return translateKey(p1, translationTable);
            });
          } else {
            return value;
          }
        } else {
          throw new Error('cxTranslate.Translation Error : ' + key + ' key not found error');
        }
      };
      this.$get = [
        '$injector',
        function ($injector) {
          var interpolator = $injector.get('$translateDefaultInterpolation'), fileLoader = $injector.get('fileLoader');
          interpolator.setLocale(config.locale);
          var translate = function (translationId, interpolateParams) {
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
            return result;
          };
          var $translate = translate;
          $translate.instant = translate;
          $translate.getLocale = function () {
            return config.locale;
          };
          $translate.getConfig = function () {
            return config;
          };
          $translate.loadFile = function (fileConfig) {
            fileConfig = fileConfig || config.file;
            if (fileConfig) {
              fileLoader(fileConfig).then(function (data) {
                translations(data);
              }, function (error) {
                console.error(error);
              });
            }
          };
          return $translate;
        }
      ];
    }]);
  cxTranslate.filter('translate', [
    '$parse',
    '$translate',
    function ($parse, $translate) {
      return function (translationId, interpolateParams) {
        var translation;
        if (!angular.isObject(interpolateParams)) {
          interpolateParams = $parse(interpolateParams)();
        }
        try {
          translation = $translate(translationId, interpolateParams);
        } catch (error) {
          translation = undefined;
        }
        return translation;
      };
    }
  ]);
  cxTranslate.directive('translate', [
    '$translate',
    '$parse',
    function ($translate, $parse) {
      return {
        restrict: 'AE',
        scope: { translate: '@' },
        link: function ($scope, $element, $attrs) {
          var translate = function translate() {
            var prefix = $attrs.prefix ? $element[0].attributes.getNamedItem($attrs.$attr.prefix).value : '', suffix = $attrs.suffix ? $element[0].attributes.getNamedItem($attrs.$attr.suffix).value : '';
            try {
              $element.html(prefix + $translate($scope.translate, $scope.interpolateParams) + suffix);
            } catch (error) {
            }
          };
          $scope.interpolateParams = {};
          if ($attrs.translateValues) {
            $scope.interpolateParams = $parse($attrs.translateValues)($scope.$parent);
            $attrs.$observe('translateValues', function (interpolateParams) {
              if (interpolateParams) {
                $scope.$parent.$watch(function () {
                  angular.extend($scope.interpolateParams, $parse(interpolateParams)($scope.$parent));
                });
              }
            });
          }
          $scope.fallbackValue = $element.html();
          $scope.$watch('translate', translate, true);
          $scope.$watch('interpolateParams', translate, true);
          translate();
        }
      };
    }
  ]);
  cxTranslate.run([
    '$translate',
    function ($translate) {
      $translate.loadFile();
    }
  ]);
}());