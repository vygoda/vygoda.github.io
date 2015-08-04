'use strict';

angular.module('vygoda-auth')

.service('AuthService', function($http, $localStorage, ENV) {
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