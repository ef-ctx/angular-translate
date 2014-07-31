ngTranslate.run([
    '$translate',
    function($translate) {
        'use strict';
        $translate.use($translate.preferredLanguage());
    }
]);
