'use strict';

angular.module('vygoda-feedback')

.factory('Feedback',
    function ($resource, $http, $localStorage, ENV) {
        return $resource(ENV.host + '/data/feedbacks/:feedbackId', {}, {
            query: { method: 'GET', params: {sortBy: "created desc"}, isArray: false,
             headers: {"user-token": $localStorage["user-token"]}
             },
            update: { method:'PUT' },
            create: { method:'POST' }
        });
    }
);