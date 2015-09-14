'use strict';

angular.module('vygoda-news')

.factory('Event',
    function ($resource, $http, ENV) {
        return $resource(ENV.host + '/data/events/:eventId', {}, {
            query: { method: 'GET', params: {pageSize: ENV.pageSize, sortBy: "eventDate desc"}, isArray: false },
            update: { method:'PUT' }

        });
    }
);