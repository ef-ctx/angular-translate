/* HTML templates */
tagsInput.run(function($templateCache) {
  'use strict';

  $templateCache.put('templates/localeSelector.tpl.html',
    "<div class=\"btn-group\"><button type=\"button\" class=\"btn btn-default dropdown-toggle\" data-toggle=\"dropdown\">Language <span class=\"caret\"></span></button><ul class=\"dropdown-menu\" role=\"menu\"><li data-ng-repeat=\"locale in localeCollection\"><span class=\"locale-{{ locale.key }}\" data-translate=\"common.localeSelector\" ng-click=\"changeLocale({{locale.key}})\"></span></li></ul></div>"
  );
});
