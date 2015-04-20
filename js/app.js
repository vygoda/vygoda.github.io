'use strict';

/* App Module */

var phonecatApp = angular.module('vygoda-dk-angular', [
    'config',
    'ngRoute',
    'dkControllers',
    'dkFilters',
    'dkServices',
    'btford.markdown',
    'ngStorage',
    'ui.bootstrap'
]);

phonecatApp.config(
    function ($routeProvider, $httpProvider) {
        $httpProvider.interceptors.push('authInterceptor');

        $routeProvider.
            when('/events', {
                templateUrl: 'partials/event-list.html',
                controller: 'EventListCtrl'
            }).
            when('/events/:eventId', {
                templateUrl: 'partials/event-detail.html',
                controller: 'EventDetailCtrl'
            }).
            when('/edit/event/:eventId', {
                templateUrl: 'partials/event-edit.html',
                controller: 'EventEditCtrl'
            }).
            when('/new/event', {
                templateUrl: 'partials/event-edit.html',
                controller: 'EventEditCtrl'
            }).
/*            when('/about', {
                templateUrl: 'partials/about-list.html',
                controller: 'AboutListCtrl'
            }).
            when('/about/:groupId', {
                templateUrl: 'partials/about-detail.html',
                controller: 'AboutDetailCtrl'
            }).
            when('/photo', {
                templateUrl: 'partials/photo-list.html',
                controller: 'PhotoListCtrl'
            }).
            when('/photo/:albumId', {
                templateUrl: 'partials/photo-detail.html',
                controller: 'PhotoDetailCtrl'
            }).
            when('/video', {
                templateUrl: 'partials/video.html',
                controller: 'VideoCtrl'
            }).
            when('/documents', {
                templateUrl: 'partials/documents.html',
                controller: 'DocumentsCtrl'
            }).
            when('/archive', {
                templateUrl: 'partials/archive.html',
                controller: 'ArchiveCtrl'
            }).
            when('/contacts', {
                templateUrl: 'partials/contacts.html',
                controller: 'ContactsCtrl'
            }).*/
            otherwise({
                redirectTo: '/events'
            });
    });

phonecatApp.factory('authInterceptor', function ($rootScope, $q, $window, $localStorage, ENV) {
    return {
        request: function (config) {
            config.headers = config.headers || {};

            config.headers["application-id"] = ENV["application-id"];
            config.headers["secret-key"] = ENV["secret-key"];

            if ($localStorage["user-token"]) {
                config.headers["user-token"] = $localStorage["user-token"];
            }

            return config;
        },
        responseError: function (rejection) {
            if (rejection.status === 401) {
                // handle the case where the user is not authenticated
                delete $localStorage["user-token"];
            }
            return $q.reject(rejection);
        }
    };
});
