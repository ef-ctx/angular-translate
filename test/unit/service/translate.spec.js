describe('pascalprecht.translate', function() {
    'use strict';

    var $httpBackend,
        $translate,
        $q,
        $rootScope,
        translationMock = {
            'EXISTING_TRANSLATION_ID': 'foo',
            'BLANK_VALUE': '',
            'TRANSLATION_ID': 'Lorem Ipsum {{value}}',
            'TRANSLATION_ID_2': 'Lorem Ipsum {{value}} + {{value}}',
            'TRANSLATION_ID_3': 'Lorem Ipsum {{value + value}}',
            'YET_ANOTHER': 'Hallo da!',
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
            $translateProvider.configure({
                file: {
                    name: 'en'
                },
                locale: 'en'
            });
        }));

        beforeEach(inject(function(_$httpBackend_) {
            $httpBackend = _$httpBackend_;
            $httpBackend.when('GET', 'en').respond(translationMock);
            $httpBackend.flush();
        }));

        beforeEach(inject(function(_$translate_, _$rootScope_, _$q_) {
            $translate = _$translate_;
            $rootScope = _$rootScope_;
            $q = _$q_;
        }));

        it('should return translation if translation id if exists', function() {
            expect($translate('EXISTING_TRANSLATION_ID')).toEqual('foo');
            expect($translate('BLANK_VALUE')).toEqual('');
        });

        it('should return translation when the translation exists and is a combination of keys', function() {
            expect($translate('home.secondGradeRecursive')).toEqual('first and second, first and second');
        });

        it('should return translation, if translation id exists with whitespace', function() {
            expect($translate('EXISTING_TRANSLATION_ID\t        \n')).toEqual('foo');
            expect($translate('\t        \nEXISTING_TRANSLATION_ID')).toEqual('foo');
            expect($translate('BLANK_VALUE\t        \n')).toEqual('');
            expect($translate('\t        \nBLANK_VALUE')).toEqual('');
        });

        it('should use $interpolate service', function() {
            expect($translate('TRANSLATION_ID')).toEqual('Lorem Ipsum ');
            expect($translate('TRANSLATION_ID', {
                value: 'foo'
            })).toEqual('Lorem Ipsum foo');
            expect($translate('TRANSLATION_ID_2', {
                value: 'foo'
            })).toEqual('Lorem Ipsum foo + foo');
            expect($translate('TRANSLATION_ID_3', {
                value: 'foo'
            })).toEqual('Lorem Ipsum foofoo');
            expect($translate('TRANSLATION_ID_3', {
                value: '3'
            })).toEqual('Lorem Ipsum 33');
            expect($translate('TRANSLATION_ID_3', {
                value: 3
            })).toEqual('Lorem Ipsum 6');
        });

        it('should support namespaces in translation ids', function() {
            expect($translate('DOCUMENT.HEADER.TITLE')).toEqual('Header');
            expect($translate('DOCUMENT.SUBHEADER.TITLE')).toEqual('2. Header');
        });
    });

    describe('$translate#linkKeyRegExp()', function() {

        var $translate;

        beforeEach(module('pascalprecht.translate', function($translateProvider) {
            $translateProvider.configure({
                file: {
                    name: 'en'
                },
                locale: 'en',
                linkKeyRegExp: /test#---(.*?)?---/g
            });
        }));

        beforeEach(inject(function(_$translate_) {
            $translate = _$translate_;
        }));

        beforeEach(inject(function(_$httpBackend_) {
            $httpBackend = _$httpBackend_;
            $httpBackend.when('GET', 'en').respond(translationMock);
            $httpBackend.flush();
        }));

        it('Should return the translation weith keys on it when a custom pattern is given', function() {
            expect($translate('differentPattern.secondGradeRecursive')).toEqual('ok, no');
        });

    });

});
