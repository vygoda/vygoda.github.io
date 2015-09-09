'use strict';

angular.module('vygoda-auth')

.factory('authInterceptor', function ($rootScope, $q, $window, $localStorage, ENV) {
    return {
        request: function (config) {
            //ToDo: remove workaround
            if (config.url.indexOf("backendless.com") <= -1) {
                return config;
            }

            config.headers = config.headers || {};

            config.headers["application-id"] = ENV["application-id"];
            config.headers["secret-key"] = ENV["secret-key"];

            if ($localStorage["user-token"]) {
                config.headers["user-token"] = $localStorage["user-token"];
            }

            return config;
        },
        responseError: function (rejection) {
            //ToDo: remove workaround
            if (rejection.config.url.indexOf("backendless.com") <= -1) {
                return $q.reject(rejection);
            }

            if (rejection.status === 401) {
                // handle the case where the user is not authenticated
                delete $localStorage["user-token"];
                $rootScope.isAuthenticated = false;
            }

            return $q.reject(rejection);
        }
    };
});