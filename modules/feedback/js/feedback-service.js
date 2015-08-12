'use strict';

angular.module('vygoda-feedback')

.factory('Feedback',
    function ($resource, $http, ENV) {
        return $resource(ENV.host + '/data/feedbacks/:feedbackId', {}, {
            create: { method:'POST' }
        });
    }
);