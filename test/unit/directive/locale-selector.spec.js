/*jshint -W087 */
describe('pascalprecht.translate', function() {
	var mocks = {
            translations: { 
                en_US: {
                    'hello': 'Hi!',
                    'buttonLabel': 'Language',
                    'language':{
                        'en_GB': 'British English',
                        'en_US': 'American English',
                        'es_ES': 'Spanish'
                    }
                },
                en_GB: {
                    'hello': 'Hello',
                    'buttonLabel': 'Language',
                    'language':{
                        'en_GB': 'British English',
                        'en_US': 'American English',
                        'es_ES': 'Spanish'
                    }
                },
                es_ES: {
                    'hello': 'HOLA!',
                    'buttonLabel': 'Lenguaje',
                    'language':{
                        'en_GB': 'Inglés Británico',
                        'en_US': 'Inglés Americano',
                        'es_ES': 'Español'
                    }
                }
            },
            locales: [ 'en_GB', 'en_US', 'es_ES']
        },
        
        $compile,
		$rootScope,
        $httpBackend,
        $templateCache,
		element;

    beforeEach(module('pascalprecht.translate'));

	beforeEach(inject(function($injector) {
		$compile = $injector.get('$compile');
		$rootScope = $injector.get('$rootScope');
        $templateCache = $injector.get('$templateCache');
	}));

	it('Should represent a list with all the locales provided', function() {
        $rootScope.locales = mocks.locales;
        $rootScope.buttonLabel = {
            text: 'Language',
            L10n: 'buttonLabel'
        };
        element = $compile("<span data-locale-selector data-languages='locales' data-label='buttonLabel'></span>") ($rootScope);
        $rootScope.$digest(); 
        expect(element.find('li').length).toBe(mocks.locales.length);

        console.log(element.find('li')[0]);
        console.log(element.find('button')[0]);
        debugger;
	});

    /*it('Should load a locale file related to the element clicked', function () {
        element = $compile("<span data-locale-selector data-locale-collection='locales' data-label='buttonLabel'></span>") ($rootScope);
        $rootScope.$digest(); 
       
        browserTrigger(angular.element(element.find('span')[4]), 'click');
        //$httpBackend.expectGET('/locale/en_US.json')respond(200, mocks.en_US);
    });*/

});
