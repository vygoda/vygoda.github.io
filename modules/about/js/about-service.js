'use strict';

angular.module('vygoda-about')

.factory('About',
    function ($resource, $http, ENV) {
        return $resource(ENV.host + '/data/abouts/:aboutId', {}, {
            query: { method: 'GET', params: {}, isArray: false },
            update: { method:'PUT' }

        });
    }
);