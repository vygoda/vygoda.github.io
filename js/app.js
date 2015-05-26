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
    'ui.bootstrap',
    'ui-notification'
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
            when('/videos', {
                templateUrl: 'partials/video-list.html',
                controller: 'VideoListCtrl'
            }).
            when('/albums', {
                templateUrl: 'partials/album-list.html',
                controller: 'AlbumListCtrl'
            }).
            //when('/album/:albumId', {
            //    templateUrl: 'partials/album-detail.html',
            //    controller: 'AlbumDetailCtrl'
            //}).
/*            when('/about', {
                templateUrl: 'partials/about-list.html',
                controller: 'AboutListCtrl'
            }).
            when('/about/:groupId', {
                templateUrl: 'partials/about-detail.html',
                controller: 'AboutDetailCtrl'
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
            //ToDo: remove workaround
            if (config.url.indexOf("backendless.com") <= -1) {
                return config;
            }

            config.headers = config.headers || {};

            config.headers["application-id"] = ENV["application-id"];
            config.headers["secret-key"] = ENV["secret-key"];

            if (config.method !== "GET" && $localStorage["user-token"]) {
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
            }
            return $q.reject(rejection);
        }
    };
});

phonecatApp.config(['markdownConverterProvider', function (markdownConverterProvider) {
    // options to be passed to Showdown
    // see: https://github.com/coreyti/showdown#extensions
    markdownConverterProvider.config({
        extensions: ['youtube', 'table']
    });
}]);
