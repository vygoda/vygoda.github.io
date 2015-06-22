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
    'chieffancypants.loadingBar',
    'ngAnimate',
    'ngOnload',
    'uiGmapgoogle-maps',
    'duScroll'
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
            when('/photo', {
                templateUrl: 'partials/collection-list.html',
                controller: 'CollectionListCtrl'
            }).
            when('/photo/:collectionId', {
                templateUrl: 'partials/album-list.html',
                controller: 'AlbumListCtrl',
                resolve: {
                    photoSetIds : function(PhotoCollection, $route) {
                        return PhotoCollection.queryPhotoSets({collection_id: $route.current.params.collectionId});
                    }
                }
            }).
            when('/documents', {
                templateUrl: 'partials/document-list.html',
                controller: 'DocumentListCtrl'
            }).
            when('/about', {
                templateUrl: 'partials/about-list.html',
                controller: 'AboutCtrl'
            }).
            when('/about/:page', {
                templateUrl: 'partials/about-list.html',
                controller: 'AboutCtrl'
            }).
            when('/edit/about/:aboutId', {
                templateUrl: 'partials/about-edit.html',
                controller: 'AboutEditCtrl'
            }).
            when('/new/about', {
                templateUrl: 'partials/about-edit.html',
                controller: 'AboutEditCtrl'
            }).
            when('/contacts', {
                templateUrl: 'partials/contacts.html',
                controller: 'ContactsCtrl'
            }).
            //when('/photo/:collectionId/album/:albumId', {
            //    templateUrl: 'partials/album-list.html',
            //    controller: 'AlbumListCtrl',
            //    resolve: {
            //        photoSetIds : null
            //    }
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

            when('/archive', {
                templateUrl: 'partials/archive.html',
                controller: 'ArchiveCtrl'
            }).
            */
            otherwise({
                redirectTo: '/events'
            });
    });

phonecatApp.config(function(cfpLoadingBarProvider) {
    cfpLoadingBarProvider.includeSpinner = true;
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

phonecatApp.run(['$route', '$rootScope', '$location', function ($route, $rootScope, $location) {
    var original = $location.path;
    $location.path = function (path, reload) {
        if (reload === false) {
            var lastRoute = $route.current;
            var un = $rootScope.$on('$locationChangeSuccess', function () {
                $route.current = lastRoute;
                un();
            });
        }
        return original.apply($location, [path]);
    };
}]);

phonecatApp.config(['uiGmapGoogleMapApiProvider', function (GoogleMapApi) {
  GoogleMapApi.configure({
    //key: 'api key',
    v: '3.17',
    libraries: 'weather,geometry,visualization'
  });
}]);
