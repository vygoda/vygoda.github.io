'use strict';

angular.module('vygoda-feedback')

.factory('Feedback',
    function ($resource, $http, ENV) {
        return $resource(ENV.host + '/data/feedbacks/:feedbackId', {}, {
            query: { method: 'GET', params: {sortBy: "created desc"}, isArray: false },
            update: { method:'PUT' },
            create: { method:'POST' }
        });
    }
);