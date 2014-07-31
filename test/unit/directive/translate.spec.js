describe('pascalprecht.translate', function() {
    'use strict';

    describe('$translateDirective (single-lang)', function() {

        var $compile,
            $rootScope,
            $httpBackend,
            element,
            translationMock = {
                'EXISTING_TRANSLATION_ID': 'foo',
                'ANOTHER_ONE': 'bar',
                'TRANSLATION_ID': 'foo',
                'TD_WITH_VALUE': 'Lorem Ipsum {{value}}',
                'TRANSLATION_ID_2': 'Lorem Ipsum {{value}} + {{value}}',
                'TRANSLATION_ID_3': 'Lorem Ipsum {{value + value}}',
                'YET_ANOTHER': 'Hallo da!',
                'TEXT_WITH_VALUE': 'This is a text with given value: {{value}}',
                'HOW_ABOUT_THIS': '{{value}} + {{value}}',
                'AND_THIS': '{{value + value}}',
                'BLANK_VALUE': ''
            };

        beforeEach(module('pascalprecht.translate', function($translateProvider) {
            $translateProvider.preferredLanguage('en');
        }));

        beforeEach(inject(function(_$httpBackend_) {
            $httpBackend = _$httpBackend_;
            $httpBackend.when('GET', 'en').respond(translationMock);
            $httpBackend.flush();
        }));

        beforeEach(inject(function(_$compile_, _$rootScope_) {
            $compile = _$compile_;
            $rootScope = _$rootScope_;
        }));

        it('should leave the content of the tag as it is if translation doesn\'t exist', function() {
            element = $compile('<div translate="TEXT">fallback text</div>')($rootScope);
            $rootScope.$digest();
            expect(element.text()).toBe('fallback text');
        });

        it('should return translation if translation id exist', function() {
            element = $compile('<div translate="TRANSLATION_ID"></div>')($rootScope);
            $rootScope.$digest();
            expect(element.text()).toBe('foo');

            element = $compile('<div translate="BLANK_VALUE"></div>')($rootScope);
            $rootScope.$digest();
            expect(element.text()).toBe('');
        });

        it('should return translation id if translation doesn\'t exist and if its passed as interpolation', function() {
            $rootScope.translationId = 'TEXT';
            element = $compile('<div translate="{{translationId}}">fallback text</div>')($rootScope);
            $rootScope.$digest();
            expect(element.text()).toBe('fallback text');
        });

        it('should return translation if translation id exist and is passed as interpolation', function() {
            $rootScope.translationId = 'TRANSLATION_ID';
            element = $compile('<div translate="{{translationId}}"></div>')($rootScope);
            $rootScope.$digest();
            expect(element.text()).toBe('foo');
        });

        it('should return translation with suffix and prefix if translation id exist and both suffix and prefix are defined', function() {
            element = $compile('<div data-translate="TRANSLATION_ID" data-prefix="custom prefix " data-suffix=" custom suffix"></div>')($rootScope);
            $rootScope.$digest();
            expect(element.text()).toBe('custom prefix foo custom suffix');
        });

        it('should return translation with suffix if translation id exist suffix is defined', function() {
            element = $compile('<div data-translate="TRANSLATION_ID" data-suffix=" custom suffix"></div>')($rootScope);
            $rootScope.$digest();
            expect(element.text()).toBe('foo custom suffix');
        });

        it('should return translation with prefix if translation id exist and prefix is defined', function() {
            element = $compile('<div data-translate="TRANSLATION_ID" data-prefix="custom prefix " ></div>')($rootScope);
            $rootScope.$digest();
            expect(element.text()).toBe('custom prefix foo');
        });


        describe('Passing values', function() {
            var element;
            describe('whereas no values given', function() {

                it('should replace interpolation directive with empty string', function() {
                    element = $compile('<div translate="TRANSLATION_ID"></div>')($rootScope);
                    $rootScope.$digest();
                    expect(element.text()).toBe('foo');
                });

                it('should replace interpolation directive with empty string when translation is an interplation', function() {
                    $rootScope.translationId = 'TD_WITH_VALUE';
                    element = $compile('<div translate="{{translationId}}"></div>')($rootScope);
                    $rootScope.$digest();
                    expect(element.text()).toBe('Lorem Ipsum ');
                });

            });

            describe('while values given as string', function() {

                it('should replace interpolate directive when td id is attribute value', function() {
                    element = $compile('<div translate="TD_WITH_VALUE" translate-values="{value: \'foo\'}"></div>')($rootScope);
                    $rootScope.$digest();
                    expect(element.text()).toBe('Lorem Ipsum foo');
                });

                it('should replace interpolate directive when td id is attribute value and interpolation', function() {
                    $rootScope.translationId = 'TD_WITH_VALUE';
                    element = $compile('<div translate="{{translationId}}" translate-values="{value: \'foo\'}"></div>')($rootScope);
                    $rootScope.$digest();
                    expect(element.text()).toBe('Lorem Ipsum foo');
                });

                it('should replace interpolate directive when td id is attribute value and interpolation', function() {
                    $rootScope.values = {
                        foo: 'bar'
                    };
                    $rootScope.translationId = 'TD_WITH_VALUE';
                    element = $compile('<div translate="{{translationId}}" translate-values="{value: values.foo}"></div>')($rootScope);
                    $rootScope.$digest();
                    expect(element.text()).toBe('Lorem Ipsum bar');
                    $rootScope.values.foo = 'catacroquer';
                    $rootScope.$digest();
                    expect(element.text()).toBe('Lorem Ipsum catacroquer');

                });

            });

            describe('while values given as interpolation directive', function() {

                it('should replace interpolate directive when td id is attribute value', function() {
                    $rootScope.values = {
                        value: 'foo'
                    };
                    element = $compile('<div translate="TD_WITH_VALUE" translate-values="values"></div>')($rootScope);
                    $rootScope.$digest();
                    expect(element.text()).toBe('Lorem Ipsum foo');
                });

                it('should replace interpolate directive when td id is attribute value and interpolation', function() {
                    $rootScope.translationId = 'TD_WITH_VALUE';
                    $rootScope.values = {
                        value: 'foo'
                    };
                    element = $compile('<div translate="{{translationId}}" translate-values="values"></div>')($rootScope);
                    $rootScope.$digest();
                    expect(element.text()).toBe('Lorem Ipsum foo');
                });

            });

            describe('while given values refer to scope data', function() {

                it('should replace interpolate directive and keep updated when td id is attribute value and refers to scope data', function() {
                    inject(function($rootScope, $compile) {
                        $rootScope.translationId = 'TD_WITH_VALUE';
                        $rootScope.user = {
                            name: 'foo'
                        };
                        element = $compile('<div translate="{{translationId}}" translate-values="{ value: user.name }"></div>')($rootScope);
                        $rootScope.$digest();
                        expect(element.text()).toBe('Lorem Ipsum foo');
                        $rootScope.user.name = 'bar';
                        $rootScope.$digest();
                        expect(element.text()).toBe('Lorem Ipsum bar');
                    });
                });
            });
        });
    });

});
