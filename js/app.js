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
    'ui-notification',
    'cloudinary',
    'angularFileUpload'
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
            when('/photos', {
                templateUrl: 'partials/photo-list.html',
                controller: 'PhotoListCtrl'
            }).
            when('/photos/new', {
                templateUrl: 'partials/photo-upload.html',
                controller: 'PhotoUploadCtrl'
            }).
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

//ToDo: remove workaround
phonecatApp.config(function($provide){
    $provide.decorator("$sanitize", function($delegate, $log){
        return function(text, target){

            var result = $delegate(text, target);

            var startTag = "<iframe width=\"480\" height=\"320\" src=\"//www.youtube.com/embed/";
            var endTag = "?autoplay=0\"\nframeborder=\"0\" allowfullscreen></iframe>";

            return result.replace("\^\$", startTag).replace("\$\^", endTag);
        };
    });
});
