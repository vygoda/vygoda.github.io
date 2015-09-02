'use strict';

angular.module('vygoda-event')

.factory('Blogger',
    function ($resource, $http, ENV) {
        return $resource('https://www.googleapis.com/blogger/v3/blogs/' + ENV["blogger-id"] + '/posts/bypath', {}, {
            query: { method: 'GET', params: {key: ENV["google-key"]}, isArray: false },
            update: { method:'PUT' }

        });
    }
);