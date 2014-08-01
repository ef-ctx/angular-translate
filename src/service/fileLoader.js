cxTranslate

.factory('fileLoader', [
    '$q',
    '$http',
    function($q, $http) {
        'use strict';
        return function(fileConfiguration) {
            var defer = $q.defer(),
                prefix = fileConfiguration.prefix || '',
                suffix = fileConfiguration.suffix || '',
                params = {
                    url: prefix + fileConfiguration.name + suffix,
                    method: 'GET',
                    params: ''
                };

            $http(params).then(function(response) {
                defer.resolve(response.data);
            }, function(error) {
                defer.reject(error);
            });

            return defer.promise;
        };

    }
]);
