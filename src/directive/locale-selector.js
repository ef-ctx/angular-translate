ngTranslate

.directive('localeSelector', [
	'$translate',
	function($translate) {
		'use strict';

        var changeLocaleHandler = function (locale) {
                $translate.use(locale);            
            },
            linkFn = function(scope) {
                scope.changeLocale = changeLocaleHandler;
            };

		return {
			restrict: 'AE',
			templateUrl: 'templates/localeSelector.tpl.html',
			scope: {
				localeCollection: '=',
				selectorLabel: '@',
                selectorLabelL10n: '@'
			},
			link: linkFn
		};
	}
]);
