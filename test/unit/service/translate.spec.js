describe('pascalprecht.translate', function() {
	'use strict';

	var translationMock = {
		'EXISTING_TRANSLATION_ID': 'foo',
		'BLANK_VALUE': '',
		'TRANSLATION_ID': 'Lorem Ipsum {{value}}',
		'TRANSLATION_ID_2': 'Lorem Ipsum {{value}} + {{value}}',
		'TRANSLATION_ID_3': 'Lorem Ipsum {{value + value}}',
		'DOCUMENT': {
			'HEADER': {
				'TITLE': 'Header'
			},
			'SUBHEADER': {
				'TITLE': '2. Header'
			}
		},
		'common': {
			'ok': 'ok',
			'no': 'no',
			'order': {
				'first': 'first',
				'second': 'second',
				'third': 'third',
				'fourth': 'fourth',
				'fifth': 'fifth',
				'sixth': 'sixth',
				'seventh': 'seventh',
				'eighth': 'eighth',
				'nineth': 'nineth'
			},
			'element': 'element',
			'list': 'list',
			'failingElement': '@:(common.order.ten)',
			'recursiveElement': '@:(common.order.first) and @:(common.order.second)'
		},
		'home': {
			'title': 'CTX Content Manager',
			'list1': {
				'1Item': '@:common.order.first',
				'2Item': 'List 1 @:common.order.second @:common.element',
				'3Item': 'List 1 @:common.order.third @:common.element',
				'4Item': 'List 1 @:common.order.fourth @:common.element',
				'5Item': 'List 1 @:common.order.fiveth @:common.element',
				'6Item': 'List 1 @:common.order.sixth @:common.element'
			},
			'list2': {
				'1Item': 'List 2 @:common.order.first @:common.element',
				'2Item': 'List 2 @:common.order.second @:common.element',
				'3Item': 'List 2 @:common.order.third @:common.element',
				'4Item': 'List 2 @:common.order.fourth @:common.element',
				'5Item': 'List 2 @:common.order.fiveth @:common.element',
				'6Item': 'List 2 @:common.order.sixth @:common.element'
			},
			'secondGradeRecursive': '@:(common.recursiveElement), @:(common.recursiveElement)',
			'secondGradeRecursiveFailing': '@:(common.failingElement)'
		},
        'differentPattern': {
			'secondGradeRecursive': 'test#---common.ok---, test#---common.no---'
        }
	};

	describe('$translate', function() {

		beforeEach(module('pascalprecht.translate', function($translateProvider) {
			$translateProvider
				.translations('en', translationMock)
				.translations('en', {
					'FOO': 'bar',
					'BAR': 'foo'
				})
				.preferredLanguage('en');
		}));

		var $translate, $STORAGE_KEY, $q, $rootScope;

		beforeEach(inject(function(_$translate_, _$STORAGE_KEY_, _$q_, _$rootScope_) {
			$translate = _$translate_;
			$STORAGE_KEY = _$STORAGE_KEY_;
			$q = _$q_;
			$rootScope = _$rootScope_;
		}));

		it('should be defined', function() {
			expect($translate).toBeDefined();
		});

		it('should be a function object', function() {
			expect(typeof $translate).toBe('function');
		});

		it('should have a method use()', function() {
			expect($translate.use).toBeDefined();
		});

		it('should have a method preferredLanguage()', function() {
			expect($translate.preferredLanguage).toBeDefined();
		});

		it('should have a method storageKey()', function() {
			expect($translate.storageKey).toBeDefined();
		});

		it('should have a method refresh()', function() {
			expect($translate.refresh).toBeDefined();
		});

		describe('$translate#preferredLanguage()', function() {

			it('should be a function', function() {
				expect(typeof $translate.preferredLanguage).toBe('function');
			});

		});

		describe('$translate#storageKey()', function() {

			it('should be a function', function() {
				expect(typeof $translate.storageKey).toBe('function');
			});

			it('should return a string', function() {
				expect(typeof $translate.storageKey()).toBe('string');
			});

			it('should be equal to $STORAGE_KEY by default', function() {
				expect($translate.storageKey()).toEqual($STORAGE_KEY);
			});
		});

		it('should return a promise', function() {
			expect($translate('FOO').then).toBeDefined();
			expect(typeof $translate('FOO').then).toEqual('function');
		});

		it('should return translation if translation id if exists', function() {
			var deferred = $q.defer(),
				promise = deferred.promise,
				value;

			promise.then(function(translation) {
				value = translation;
			});

			$q.all([
				$translate('EXISTING_TRANSLATION_ID'),
				$translate('BLANK_VALUE')
			]).then(function(translations) {
				deferred.resolve(translations);
			});

			$rootScope.$digest();
			expect(value[0]).toEqual('foo');
			expect(value[1]).toEqual('');
		});

		it('should return translation when the translation exists and is a combination of keys', function() {
			var deferred = $q.defer(),
				promise = deferred.promise,
				value;

			promise.then(function(translation) {
				value = translation;
			});

            $translate('home.secondGradeRecursive')
			.then(function(translations){
                deferred.resolve(translations);
			});

			$rootScope.$digest();
			expect(value).toEqual('first and second, first and second');
		});

		it('should return an Error when the translation exists and is a combination of keys but some of the keys doesn`t exist', function() {
			var deferred = $q.defer(),
				promise = deferred.promise,
				value;

			promise.then(undefined,
				function(error) {
					value = error;
				});

			$translate('home.secondGradeRecursiveFailing')
            .then(undefined, function(error) {
                deferred.reject(error);
            }); 
			
            $rootScope.$digest();
			expect(value.stack).toBeDefined();
			expect(value.message).toBeDefined();
		});

		it('should return the translation if exists and is a combination of keys following a custom pattern', function() {
			var deferred = $q.defer(),
				promise = deferred.promise,
				value;

			promise.then(undefined,
				function(error) {
					value = error;
				});

			$translate('home.secondGradeRecursiveFailing')
            .then(undefined, function(error) {
                deferred.reject(error);
            }); 
			
            $rootScope.$digest();
			expect(value.stack).toBeDefined();
			expect(value.message).toBeDefined();
		});

		it('should return translation, if translation id exists with whitespace', function() {
			var deferred = $q.defer(),
				promise = deferred.promise,
				value;

			promise.then(function(translation) {
				value = translation;
			});

			$q.all([
				$translate('EXISTING_TRANSLATION_ID\t        \n'),
				$translate('\t        \nEXISTING_TRANSLATION_ID'),
				$translate('BLANK_VALUE\t        \n'),
				$translate('\t        \nBLANK_VALUE')
			]).then(function(translations) {
				deferred.resolve(translations);
			});

			$rootScope.$digest();
			expect(value[0]).toEqual('foo');
			expect(value[1]).toEqual('foo');
			expect(value[2]).toEqual('');
			expect(value[3]).toEqual('');
		});

		it('should use $interpolate service', function() {
			var deferred = $q.defer(),
				promise = deferred.promise,
				value;

			promise.then(function(translation) {
				value = translation;
			});

			$q.all([
				$translate('TRANSLATION_ID'),
				$translate('TRANSLATION_ID', {
					value: 'foo'
				}),
				$translate('TRANSLATION_ID_2', {
					value: 'foo'
				}),
				$translate('TRANSLATION_ID_3', {
					value: 'foo'
				}),
				$translate('TRANSLATION_ID_3', {
					value: '3'
				}),
				$translate('TRANSLATION_ID_3', {
					value: 3
				})
			]).then(function(translations) {
				deferred.resolve(translations);
			});

			$rootScope.$digest();
			expect(value[0]).toEqual('Lorem Ipsum ');
			expect(value[1]).toEqual('Lorem Ipsum foo');
			expect(value[2]).toEqual('Lorem Ipsum foo + foo');
			expect(value[3]).toEqual('Lorem Ipsum foofoo');
			expect(value[4]).toEqual('Lorem Ipsum 33');
			expect(value[5]).toEqual('Lorem Ipsum 6');
		});

		it('should extend translation table rather then overwriting it', function() {
			var deferred = $q.defer(),
				promise = deferred.promise,
				value;

			promise.then(function(translation) {
				value = translation;
			});

			$q.all([
				$translate("FOO"),
				$translate("BAR")
			]).then(function(translations) {
				deferred.resolve(translations);
			});

			$rootScope.$digest();
			expect(value[0]).toEqual('bar');
			expect(value[1]).toEqual('foo');
		});

		it('should support namespaces in translation ids', function() {
			var deferred = $q.defer(),
				promise = deferred.promise,
				value;

			promise.then(function(translation) {
				value = translation;
			});

			$q.all([
				$translate("DOCUMENT.HEADER.TITLE"),
				$translate("DOCUMENT.SUBHEADER.TITLE")
			]).then(function(translations) {
				deferred.resolve(translations);
			});

			$rootScope.$digest();
			expect(value[0]).toEqual('Header');
			expect(value[1]).toEqual('2. Header');
		});
	});
	
    describe('$translate#linkKeyRegExp()', function() {
		beforeEach(module('pascalprecht.translate', function($translateProvider) {
			$translateProvider
				.translations('en', translationMock)
				.preferredLanguage('en')
                .linkKeyRegExp(/test#---(.*?)?---/g)
                ;
		}));

		var $translate, $STORAGE_KEY, $q, $rootScope;

		beforeEach(inject(function(_$translate_, _$STORAGE_KEY_, _$q_, _$rootScope_) {
			$translate = _$translate_;
			$STORAGE_KEY = _$STORAGE_KEY_;
			$q = _$q_;
			$rootScope = _$rootScope_;
		}));
        

        it('Should return the translation weith keys on it when a custom pattern is given', function (){
			var deferred = $q.defer(),
				promise = deferred.promise,
				value;
            
			promise.then(function (translaation){
                    value = translaation;
                },
				function(error) {
					value = error;
				});

			$translate('differentPattern.secondGradeRecursive')
            .then(function (translation) {
                deferred.resolve(translation);
            }, function(error) {
                deferred.reject(error);
            }); 
			
            $rootScope.$digest();
			expect(value).toEqual('ok, no');
        });

	});

	describe('$translate#use()', function() {

		beforeEach(module('pascalprecht.translate', function($translateProvider) {
			$translateProvider
				.translations('de_DE', translationMock)
				.translations('de_DE', {
					'YET_ANOTHER': 'Hallo da!'
				})
				.translations('en_EN', {
					'YET_ANOTHER': 'Hello there!'
				})
				.preferredLanguage('de_DE');
		}));

		var $translate, $rootScope, $STORAGE_KEY, $q;

		beforeEach(inject(function(_$translate_, _$rootScope_, _$STORAGE_KEY_, _$q_) {
			$translate = _$translate_;
			$rootScope = _$rootScope_;
			$STORAGE_KEY = _$STORAGE_KEY_;
			$q = _$q_;
		}));

		it('should be a function', function() {
			expect(typeof $translate.use).toBe('function');
		});

		it('should return a string', function() {
			expect(typeof $translate.use()).toBe('string');
		});

		it('should return language key', function() {
			expect($translate.use()).toEqual('de_DE');
		});

		it('should change language at runtime', function() {
			var deferred = $q.defer(),
				promise = deferred.promise,
				value;

			promise.then(function(translation) {
				value = translation;
			});

			$translate.use('en_EN');
			$translate('YET_ANOTHER').then(function(translation) {
				deferred.resolve(translation);
			});
			$rootScope.$digest();
			expect(value).toEqual('Hello there!');
		});
	});

	describe('$translate#storageKey()', function() {

		beforeEach(module('pascalprecht.translate', function($translateProvider) {
			$translateProvider.storageKey('foo');
		}));

		var $translate, $STORAGE_KEY;

		beforeEach(inject(function(_$translate_, _$STORAGE_KEY_) {
			$translate = _$translate_;
			$STORAGE_KEY = _$STORAGE_KEY_;
		}));

		it('should allow to change the storage key during config', function() {
			expect($translate.storageKey()).toNotEqual($STORAGE_KEY);
		});

		it('shouldn\'t allow to change the storage key during runtime', function() {
			var prevKey = $translate.storageKey();
			$translate.storageKey(prevKey + "somestring");
			expect($translate.storageKey()).toEqual(prevKey);
		});
	});

	describe('$translateService#preferredLanguage()', function() {

		beforeEach(module('pascalprecht.translate', function($translateProvider) {
			$translateProvider.preferredLanguage('de_DE');
		}));

		var $translate;

		beforeEach(inject(function(_$translate_) {
			$translate = _$translate_;
		}));

		it('should return a string if language is specified', function() {
			expect(typeof $translate.preferredLanguage()).toBe('string');
		});

		it('should return a correct language code', function() {
			expect($translate.preferredLanguage()).toEqual('de_DE');
		});
	});

	describe('$translateProvider#useLoader', function() {

		beforeEach(module('pascalprecht.translate', function($translateProvider, $provide) {
			$translateProvider
				.useLoader('customLoader')
				.preferredLanguage('en');
			$provide.factory('customLoader', ['$q', '$timeout',
				function($q, $timeout) {
					return function(options) {
						var deferred = $q.defer();

						$timeout(function() {
							deferred.resolve({
								FOO: 'bar'
							});
						}, 1000);

						return deferred.promise;
					};
				}
			]);
		}));

		it('should use custom loader', function() {
			inject(function($translate, $timeout, $q) {
				var deferred = $q.defer(),
					promise = deferred.promise,
					value;

				promise.then(function(translation) {
					value = translation;
				});

				$translate('FOO').then(function(translation) {
					deferred.resolve(translation);
				}, function() {
					deferred.resolve('foo');
				});
				$timeout.flush();
				expect(value).toEqual('bar');
			});
		});
	});

	describe('$translateProvider#useMessageFormatInterpolation()', function() {


		beforeEach(module('pascalprecht.translate', function($translateProvider) {

			$translateProvider
				.translations('en', {
					'REPLACE_VARS': 'Foo bar {value}',
					'SELECT_FORMAT': '{GENDER, select, male{He} female{She} other{They}} liked this.',
					'PLURAL_FORMAT': 'There {NUM_RESULTS, plural, one{is one result} other{are # results}}.',
					'PLURAL_FORMAT_OFFSET': 'You {NUM_ADDS, plural, offset:1' +
						'=0{didnt add this to your profile}' + // Number literals, with a `=` do **NOT** use
					'zero{added this to your profile}' + //   the offset value
					'one{and one other person added this to their profile}' +
						'other{and # others added this to their profiles}' +
						'}.'
				})
				.useMessageFormatInterpolation()
				.preferredLanguage('en');
		}));

		var $translate, $q, $rootScope;

		beforeEach(inject(function(_$translate_, _$rootScope_, _$q_) {
			$translate = _$translate_;
			$rootScope = _$rootScope_;
			$q = _$q_;
		}));

		it('should replace interpolateParams with concrete values', function() {
			var deferred = $q.defer(),
				promise = deferred.promise,
				value;

			promise.then(function(translation) {
				value = translation;
			});
			$translate('REPLACE_VARS', {
				value: 5
			}).then(function(translation) {
				deferred.resolve(translation);
			});
			$rootScope.$digest();
			expect(value).toEqual('Foo bar 5');
		});

		it('should support SelectFormat', function() {
			var deferred = $q.defer(),
				promise = deferred.promise,
				value;

			promise.then(function(translation) {
				value = translation;
			});
			$translate('SELECT_FORMAT', {
				GENDER: 'male'
			}).then(function(translation) {
				deferred.resolve(translation);
			});

			$rootScope.$digest();
			expect(value).toEqual('He liked this.');
		});

		it('should support PluralFormat', function() {
			var deferred = $q.defer(),
				promise = deferred.promise,
				value;

			promise.then(function(translation) {
				value = translation;
			});
			$translate('PLURAL_FORMAT', {
				'NUM_RESULTS': 0
			}).then(function(translation) {
				deferred.resolve(translation);
			});
			$rootScope.$digest();
			expect(value).toEqual('There are 0 results.');
		});

		it('should support PluralFormat - offset extension', function() {
			var deferred = $q.defer(),
				promise = deferred.promise,
				value;

			promise.then(function(translation) {
				value = translation;
			});
			$translate('PLURAL_FORMAT_OFFSET', {
				'NUM_ADDS': 0
			}).then(function(translation) {
				deferred.resolve(translation);
			});
			$rootScope.$digest();
			expect(value).toEqual('You didnt add this to your profile.');
		});
	});

	describe('$translateProvider#addInterpolation', function() {

		beforeEach(module('pascalprecht.translate', function($translateProvider, $provide) {

			$provide.factory('customInterpolation', function() {

				var translateInterpolator = {},
					$locale;

				// provide a method to set locale
				translateInterpolator.setLocale = function(locale) {
					$locale = locale;
				};

				// provide a method to return an interpolation identifier
				translateInterpolator.getInterpolationIdentifier = function() {
					return 'custom';
				};

				// defining the actual interpolate function
				translateInterpolator.interpolate = function() {
					if ($locale === 'de') {
						return 'foo';
					} else {
						return 'custom interpolation';
					}
				};

				return translateInterpolator;
			});

			// tell angular-translate to optionally use customInterpolation
			$translateProvider
				.addInterpolation('customInterpolation')
				.translations('en', {
					'FOO': 'Some text'
				})
				.translations('de', {
					'FOO': 'Irgendwas',
					'BAR': 'yupp'
				})
				.preferredLanguage('en');
		}));

		var $translate, $rootScope, $q;

		beforeEach(inject(function(_$translate_, _$rootScope_, _$q_) {
			$translate = _$translate_;
			$rootScope = _$rootScope_;
			$q = _$q_;
			$rootScope.$apply();
		}));

		it('should translate', function() {
			var deferred = $q.defer(),
				promise = deferred.promise,
				value;

			promise.then(function(translation) {
				value = translation;
			});
			$translate('FOO').then(function(translation) {
				deferred.resolve(translation);
			});

			$rootScope.$digest();
			expect(value).toEqual('Some text');
		});

		it('should use custom interpolation', function() {
			var deferred = $q.defer(),
				promise = deferred.promise,
				value;

			promise.then(function(translation) {
				value = translation;
			});
			$translate('FOO', {}, 'custom').then(function(translation) {
				deferred.resolve(translation);
			});

			$rootScope.$digest();
			expect(value).toEqual('custom interpolation');
		});

	});

	describe('$translate#proposedLanguage', function() {

		var $translate;

		beforeEach(module('pascalprecht.translate', function($translateProvider, $provide) {

			$provide.factory('customLoader', function($q, $timeout) {
				return function() {
					var deferred = $q.defer();

					$timeout(function() {
						deferred.resolve({});
					}, 1000);

					return deferred.promise;
				};
			});

			$translateProvider
				.useLoader('customLoader')
				.preferredLanguage('en');
		}));

		beforeEach(inject(function(_$translate_) {
			$translate = _$translate_;
		}));

		it('should have a method proposedLanguage()', function() {
			expect($translate.proposedLanguage).toBeDefined();
		});

		it('should be a use function ', function() {
			expect(typeof $translate.proposedLanguage).toBe('function');
		});

		it('should return a string', function() {
			expect(typeof $translate.proposedLanguage()).toBe('string');
		});

		it('should return proposedLanguage', function() {
			expect($translate.proposedLanguage()).toEqual('en');
		});

		it('should be undefine when no there\'s no pending loader', function() {
			inject(function($timeout) {
				$timeout.flush();
				expect($translate.proposedLanguage()).toBeUndefined();
			});
		});
	});

	describe('$translate#refresh', function() {

		describe('no loader registered', function() {

			beforeEach(module('pascalprecht.translate'));

			var $translate;

			beforeEach(inject(function(_$translate_) {
				$translate = _$translate_;
			}));

			it('should be a function', function() {
				expect(typeof $translate.refresh).toBe('function');
			});

			it('should throw an error', function() {
				expect(function() {
					$translate.refresh();
				}).toThrow('Couldn\'t refresh translation table, no loader registered!');
			});
		});

		describe('loader registered', function() {

			beforeEach(module('pascalprecht.translate', function($translateProvider, $provide) {
				$translateProvider
					.translations('de_DE', translationMock)
					.preferredLanguage('en_EN')
					.useLoader('customLoader');

				$provide.factory('customLoader', ['$q', '$timeout',
					function($q, $timeout) {

						return function() {
							var deferred = $q.defer();

							$timeout(function() {
								deferred.resolve({
									'FOO': 'bar'
								});
							});

							return deferred.promise;
						};
					}
				]);
			}));

			var $translate, $timeout, $rootScope, $q;

			beforeEach(inject(function(_$translate_, _$timeout_, _$rootScope_, _$q_) {
				$translate = _$translate_;
				$timeout = _$timeout_;
				$rootScope = _$rootScope_;
				$q = _$q_;
			}));

			it('should return a promise', function() {
				expect($translate.refresh().then).toBeDefined();
			});

			it('should emit $translateRefreshStart event', function() {
				spyOn($rootScope, '$emit');
				$translate.refresh();
				$timeout.flush();
				expect($rootScope.$emit).toHaveBeenCalledWith('$translateRefreshStart');
			});

			it('should emit $translateRefreshEnd', function() {
				spyOn($rootScope, '$emit');
				$translate.refresh();
				$timeout.flush();
				expect($rootScope.$emit).toHaveBeenCalledWith('$translateRefreshEnd');
			});

			it('should emit $translateChangeSuccess event', function() {
				spyOn($rootScope, '$emit');
				$translate.refresh();
				$timeout.flush();
				expect($rootScope.$emit).toHaveBeenCalledWith('$translateChangeSuccess');
			});
		});
	});

	describe('$translateProvider#determinePreferredLanguage()', function() {

		describe('without locale negotiation', function() {

			beforeEach(module('pascalprecht.translate', function($translateProvider) {
				$translateProvider
					.translations('en_US', {
						FOO: 'bar'
					})
					.translations('de_DE', {
						FOO: 'foo'
					})
					.determinePreferredLanguage(function() {
						// mocking
						// Work's like `window.navigator.lang = 'en_US'`
						var nav = {
							language: 'en_US'
						};
						return ((
							nav.language ||
							nav.browserLanguage ||
							nav.systemLanguage ||
							nav.userLanguage
						) || '').split('-').join('_');
					});
			}));

			it('should determine browser language', function() {
				inject(function($translate, $q, $rootScope) {
					var deferred = $q.defer(),
						promise = deferred.promise,
						value;

					promise.then(function(foo) {
						value = foo;
					});
					$translate('FOO').then(function(translation) {
						deferred.resolve(translation);
					});
					$rootScope.$digest();
					expect(value).toEqual('bar');
				});
			});
		});

		describe('with locale negotiation', function() {

			beforeEach(module('pascalprecht.translate', function($translateProvider) {
				$translateProvider
					.translations('en', {
						FOO: 'bar'
					})
					.translations('de', {
						FOO: 'foo'
					})
					.registerAvailableLanguageKeys(['en', 'de'], {
						'en_US': 'en',
						'de_DE': 'de'
					})
					.determinePreferredLanguage(function() {
						// mocking
						// Work's like `window.navigator.lang = 'en_US'`
						var nav = {
							language: 'en_US'
						};
						return ((
							nav.language ||
							nav.browserLanguage ||
							nav.systemLanguage ||
							nav.userLanguage
						) || '').split('-').join('_');
					});
			}));

			it('should determine browser language', function() {
				inject(function($translate, $q, $rootScope) {
					var deferred = $q.defer(),
						promise = deferred.promise,
						value;

					promise.then(function(foo) {
						value = foo;
					});

					$translate('FOO').then(function(translation) {
						deferred.resolve(translation);
					});

					$rootScope.$digest();
					expect(value).toEqual('bar');

				});
			});
		});
	});

});
