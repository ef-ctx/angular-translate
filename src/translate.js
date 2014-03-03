
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
