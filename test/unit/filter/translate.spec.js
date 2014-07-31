describe('pascalprecht.translate', function() {

    'use strict';
    var translationMock = {
        'EXISTING_TRANSLATION_ID': 'foo',
        'ANOTHER_ONE': 'bar',
        'TRANSLATION_ID': 'Lorem Ipsum {{value}}',
        'TRANSLATION_ID_2': 'Lorem Ipsum {{value}} + {{value}}',
        'TRANSLATION_ID_3': 'Lorem Ipsum {{value + value}}',
        'YET_ANOTHER': 'Hallo da!',
        'TEXT': 'this is a text',
        'TEXT_WITH_VALUE': 'This is a text with given value: {{value}}',
        'HOW_ABOUT_THIS': '{{value}} + {{value}}',
        'AND_THIS': '{{value + value}}',
        'BLANK_VALUE': ''
    };

    describe('$translateFilter', function() {

        beforeEach(module('pascalprecht.translate', function($translateProvider) {
            $translateProvider.preferredLanguage('en');
        }));

        var $filter, $q, $httpBackend, $rootScope, $translate;

        beforeEach(inject(function(_$httpBackend_) {
            $httpBackend = _$httpBackend_;
            $httpBackend.when('GET', 'en').respond(200, translationMock);
            $httpBackend.flush();
        }));

        beforeEach(inject(function(_$filter_, _$q_, _$rootScope_) {
            $filter = _$filter_;
            $q = _$q_;
            $rootScope = _$rootScope_;
            $translate = $filter('translate');
        }));

        it('should be a function object', function() {
            expect(typeof $translate).toBe('function');
        });

        it('should return undefined if translation doesn\'t exist', function() {
            expect($translate('WOOP')).toEqual(undefined);
        });

        it('should return translation if translation id exist', function() {
            expect($translate('TRANSLATION_ID')).toEqual('Lorem Ipsum ');
        });

        it('should replace interpolate directives with empty string if no values given', function() {
            expect($translate('TRANSLATION_ID')).toEqual('Lorem Ipsum ');
        });

        it('should replace interpolate directives with given values', function() {
            var value = [
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
            ];

            expect(value[0]).toEqual('Lorem Ipsum foo');
            expect(value[1]).toEqual('Lorem Ipsum foo + foo');
            expect(value[2]).toEqual('Lorem Ipsum foofoo');
            expect(value[3]).toEqual('Lorem Ipsum 33');
            expect(value[4]).toEqual('Lorem Ipsum 6');
        });

        it('should replace interpolate directives with given values as string expression', function() {
            var value = [
                $translate('TEXT'),
                $translate('TEXT_WITH_VALUE'),
                $translate('TEXT_WITH_VALUE', "{'value': 'dynamic value'}"),
                $translate('TEXT_WITH_VALUE', "{'value': '3'}"),
                $translate('HOW_ABOUT_THIS', "{'value': '4'}"),
                $translate('AND_THIS', "{'value': 5}"),
                $translate('AND_THIS', "{'value': '5'}")
            ];

            expect(value[0]).toEqual('this is a text');
            expect(value[1]).toEqual('This is a text with given value: ');
            expect(value[2]).toEqual('This is a text with given value: dynamic value');
            expect(value[3]).toEqual('This is a text with given value: 3');
            expect(value[4]).toEqual('4 + 4');
            expect(value[5]).toEqual('10');
            expect(value[6]).toEqual('55');
        });
    });
});
