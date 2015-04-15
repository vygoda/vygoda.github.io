'use strict';

/* App Module */

var phonecatApp = angular.module('vygoda-dk-angular', [
    'config',
    'ngRoute',
    'phonecatControllers',
    'phonecatFilters',
    'phonecatServices',
    'btford.markdown',
    'ui.bootstrap'
]);

phonecatApp.config(
    function ($routeProvider, $httpProvider) {
        $httpProvider.interceptors.push('authInterceptor');

        $routeProvider.
            when('/events', {
                templateUrl: 'partials/phone-list.html',
                controller: 'PhoneListCtrl'
            }).
            when('/events/:eventId', {
                templateUrl: 'partials/phone-detail.html',
                controller: 'PhoneDetailCtrl'
            }).
            when('/about', {
                templateUrl: 'partials/phone-detail.html',
                controller: 'PhoneDetailCtrl'
            }).
            when('/about/:groupId', {
                templateUrl: 'partials/phone-detail.html',
                controller: 'PhoneDetailCtrl'
            }).
            when('/contacts', {
                templateUrl: 'partials/phone-detail.html',
                controller: 'PhoneDetailCtrl'
            }).
            when('/video', {
                templateUrl: 'partials/phone-detail.html',
                controller: 'PhoneDetailCtrl'
            }).
            when('/photo', {
                templateUrl: 'partials/phone-detail.html',
                controller: 'PhoneDetailCtrl'
            }).
            when('/photo/:albumId', {
                templateUrl: 'partials/phone-detail.html',
                controller: 'PhoneDetailCtrl'
            }).
            when('/documents', {
                templateUrl: 'partials/phone-detail.html',
                controller: 'PhoneDetailCtrl'
            }).
            otherwise({
                redirectTo: '/events'
            });
    });

phonecatApp.factory('authInterceptor', function ($rootScope, $q, $window, ENV) {
    return {
        request: function (config) {
            config.headers = config.headers || {};

            config.headers["application-id"] = ENV["application-id"];
            config.headers["secret-key"] = ENV["secret-key"];

            if ($window.sessionStorage["user-token"]) {
                config.headers["user-token"] = $window.sessionStorage["user-token"];
            }

            return config;
        },
        responseError: function (rejection) {
            if (rejection.status === 401) {
                // handle the case where the user is not authenticated
                delete $window.sessionStorage["user-token"];
            }
            return $q.reject(rejection);
        }
    };
});
