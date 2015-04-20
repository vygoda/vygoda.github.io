'use strict';

var dkServices = angular.module('dkServices', ['ngResource']);

dkServices.factory('Event',
    function ($resource, $http, ENV) {
        return $resource(ENV.host + '/data/events/:eventId', {}, {
            query: { method: 'GET', params: {}, isArray: false },
            update: { method:'PUT' }

        });
    });

dkServices.service('AuthService', function($http, $localStorage, ENV) {
    var logout = function (successHandler) {
        delete $localStorage["user-token"];
        delete $localStorage.userData;
        delete $localStorage.error;
        delete $localStorage.errorCode;

        if (successHandler) {
            successHandler();
        }
    };

    this.logout = logout;

    this.login = function (user, successHandler, errorHandler) {
        $http
            .post(ENV.host + '/users/login', user)
            .success(function (data, status, headers, config) {
                logout();

                $localStorage["user-token"] = data["user-token"];
                $localStorage.userData = data;

                if (successHandler) {
                    successHandler(data);
                }
               })
            .error(function (data, status, headers, config) {
                logout();

                $localStorage.error = data.message;
                $localStorage.errorCode = data.code;

                if (errorHandler) {
                    errorHandler(data);
                }
             });
    };
});
