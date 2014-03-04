ngTranslate

.directive('localeSelector', [
	'$translate', 'ngTranslateConfig',
	function($translate, config) {
		'use strict';

        var changeLocaleHandler = function (locale) {
                $translate.use(locale);            
            },
            linkFn = function(scope) {
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
            priority:1,
			link: linkFn
		};
	}
]);
