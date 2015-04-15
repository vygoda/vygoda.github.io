'use strict';

var dkServices = angular.module('dkServices', ['ngResource']);

dkServices.factory('Phone',
    function ($resource, $http, $window, ENV) {
        return $resource(ENV.host + '/data/test/:eventId', {}, {
            query: {method: 'GET', params: {}, isArray: false}
        });
    });

dkServices.service('AuthService', function($http, $window, ENV) {
    var logout = function (successHandler) {
        delete $window.sessionStorage["user-token"];
        delete $window.sessionStorage.userData;
        delete $window.sessionStorage.error;
        delete $window.sessionStorage.errorCode;

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

                $window.sessionStorage["user-token"] = data["user-token"];
                $window.sessionStorage.userData = data;

                if (successHandler) {
                    successHandler(data);
                }
               })
            .error(function (data, status, headers, config) {
                logout();

                $window.sessionStorage.error = data.message;
                $window.sessionStorage.errorCode = data.code;

                if (errorHandler) {
                    errorHandler(data);
                }
             });
    };
});
