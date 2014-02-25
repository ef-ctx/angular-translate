describe('pascalprecht.translate', function() {

	describe('$translateMissingTranslationHandlerLog', function() {

		beforeEach(module('pascalprecht.translate'));

		var $translateMissingTranslationHandlerLog, $log;

		beforeEach(inject(function(_$translateMissingTranslationHandlerLog_, _$log_) {
			$translateMissingTranslationHandlerLog = _$translateMissingTranslationHandlerLog_;
			$log = _$log_;
		}));

		it('should be defined', function() {
			expect($translateMissingTranslationHandlerLog).toBeDefined();
		});

		it('should be a function', function() {
			expect(typeof $translateMissingTranslationHandlerLog).toBe('function');
		});

		it('should use $log service to log message', function() {
			spyOn($log, 'warn');
			$translateMissingTranslationHandlerLog();
			expect($log.warn).toHaveBeenCalled();
		});

	});

	describe('$translateProvider#useMissingTranslationHandler', function() {

		beforeEach(module('pascalprecht.translate', function($translateProvider) {
			$translateProvider.useMissingTranslationHandler('$translateMissingTranslationHandlerLog');
		}));

		var $translate, $log;

		beforeEach(inject(function(_$translate_, _$log_) {
			$translate = _$translate_;
			$log = _$log_;
		}));

	});

	describe('$translateProvider#useMissingTranslationHandlerLog', function() {

		beforeEach(module('pascalprecht.translate', function($translateProvider) {
			$translateProvider.useMissingTranslationHandlerLog();
		}));

		var $translate, $log;

		beforeEach(inject(function(_$translate_, _$log_) {
			$translate = _$translate_;
			$log = _$log_;
		}));

	});
});
