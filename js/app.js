'use strict';

/* App Module */

angular.module('vygoda-common', []);
angular.module('vygoda-auth', []);
angular.module('vygoda-event', []);
angular.module('vygoda-photo', []);
angular.module('vygoda-document', []);
angular.module('vygoda-video', []);
//angular.module('vygoda-about', []);
//angular.module('vygoda-contact', []);

angular.module('vygoda-web', [
    'vygoda-common',
    'vygoda-auth',
    'vygoda-event',
    'vygoda-photo',
    'vygoda-document',
    'vygoda-video',
//    'vygoda-about',
//    'vygoda-contact',
    'config',
    'ngResource',
    'ngRoute',
    'btford.markdown',
    'ngStorage',
    'ui.bootstrap',
    'ui-notification',
    'chieffancypants.loadingBar',
    'ngAnimate',
    'ngOnload',
    'uiGmapgoogle-maps',
    'duScroll',
    'ezfb'
])

.config(function($locationProvider) {
  $locationProvider.html5Mode(true).hashPrefix('!');
})

.config(
    function ($routeProvider, $httpProvider) {
        $httpProvider.interceptors.push('authInterceptor');

        $routeProvider.
            when('/events', {
                templateUrl: 'modules/event/view/event-list.html',
                controller: 'EventListCtrl'
            }).
            when('/events/:page', {
                templateUrl: 'modules/event/view/event-list.html',
                controller: 'EventListCtrl'
            }).
            when('/event/:eventId', {
                templateUrl: 'modules/event/view/event-detail.html',
                controller: 'EventDetailCtrl'
            }).
            when('/edit/event/:eventId', {
                templateUrl: 'modules/event/view/event-edit.html',
                controller: 'EventEditCtrl'
            }).
            when('/new/event', {
                templateUrl: 'modules/event/view/event-edit.html',
                controller: 'EventEditCtrl'
            }).


            when('/videos', {
                templateUrl: 'modules/video/view/video-list.html',
                controller: 'VideoListCtrl'
            }).

            when('/photo', {
                templateUrl: 'modules/photo/view/collection-list.html',
                controller: 'PhotoCollectionCtrl'
            }).
            when('/photo/:collectionId', {
                templateUrl: 'modules/photo/view/album-list.html',
                controller: 'PhotoSetCtrl',
                resolve: {
                    photoSetIds : function(PhotoCollection, $route) {
                        return PhotoCollection.queryPhotoSets({collection_id: $route.current.params.collectionId});
                    }
                }
            }).

            when('/documents', {
                templateUrl: 'modules/document/view/documents.html',
                controller: 'DocumentsCtrl'
            }).

//            when('/about', {
//                templateUrl: 'modules/about/view/about-list.html',
//                controller: 'AboutListCtrl'
//            }).
//            when('/about/:page', {
//                templateUrl: 'modules/about/view/about-list.html',
//                controller: 'AboutListCtrl'
//            }).
//            when('/edit/about/:aboutId', {
//                templateUrl: 'modules/about/view/about-edit.html',
//                controller: 'AboutEditCtrl'
//            }).
//            when('/new/about', {
//                templateUrl: 'modules/about/view/about-edit.html',
//                controller: 'AboutEditCtrl'
//            }).

//            when('/contacts', {
//                templateUrl: 'modules/contact/view/contacts.html',
//                controller: 'ContactsCtrl'
//            }).
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
    })

.config(function(cfpLoadingBarProvider) {
    cfpLoadingBarProvider.includeSpinner = true;
  })



.run(['$route', '$rootScope', '$location', function ($route, $rootScope, $location) {
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
}])

.config(['uiGmapGoogleMapApiProvider', function (GoogleMapApi) {
  GoogleMapApi.configure({
    //key: 'api key',
    v: '3.17',
    libraries: 'weather,geometry,visualization'
  });
}])

.config(['cfpLoadingBarProvider', function(cfpLoadingBarProvider) {
    cfpLoadingBarProvider.includeSpinner = true;
  }])

.config(function($provide){
    $provide.decorator("$sanitize", function($delegate, $log){
        return function(text, target){

            var result = $delegate(text, target);

            var startStr = "[flash=";
            var endStr = "]";

            var start = result.indexOf(startStr);

            if (start == -1) {
                return result;
            }

            var end = result.indexOf(endStr, start);
            var str = result.substring(start + startStr.length, end);

            var params = str.split(',');
            var resultValue = result.substring(0, start) +
            "<iframe width=\"" + params[0] + "\" height=\"" + params[1]
             + "\" src=\"" + params[2] + "\"\nframeborder=\"0\" scrolling=\"no\" allowfullscreen></iframe>" +
             result.substring(end + endStr.length, result.length);

            return resultValue;
        };
    });
})

.config(function($provide){
    $provide.decorator("$sanitize", function($delegate, $log){
        return function(text, target){
            var result = $delegate(text, target);

            var startStr = "[youtube=";
            var endStr = "]";

            var start = result.indexOf(startStr);

            if (start == -1) {
                return result;
            }

            var end = result.indexOf(endStr, start);
            var str = result.substring(start + startStr.length, end);

            var params = str.split(',');
            var url = params[2];

            var youtube = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;

            if (youtube.test(url)) {
                var m = url.match(youtube);

                if (m && m[7].length === 11) {
                    var video_id = m[7];
                    url = 'http://www.youtube.com/embed/' + video_id + '?autoplay=0';

                    var resultValue = result.substring(0, start) +
                    "<iframe width=\"" + params[0] + "\" height=\"" + params[1]
                     + "\" src=\"" + url + "\"\nframeborder=\"0\" scrolling=\"no\" allowfullscreen></iframe>" +
                     result.substring(end + endStr.length, result.length);

                     return resultValue;
                }
            }

            return result;
        };
    });
})

.config(function($provide){
    $provide.decorator("$sanitize", function($delegate, $log){
        return function(text, target){

            var result = $delegate(text, target);

            var startStr = "[flickr=";
            var endStr = "]";

            var start = result.indexOf(startStr);

            if (start == -1) {
                return result;
            }

            var end = result.indexOf(endStr, start);
            var str = result.substring(start + startStr.length, end);

            var params = str.split(',');

            var resultValue = result.substring(0, start) +
            "<iframe id='iframe' src='//flickrit.com/slideshowholder.php?height=" + params[1] + "&width=" + params[0] + "&size=medium&speed=8&setId=" + params[2] + "&credit=1&trans=1&theme=1&thumbnails=2&transition=1&layoutType=fixed&sort=0' scrolling='no' frameborder='0' width='" + params[0] + "' height='" + params[1] + "'></iframe>" +
            result.substring(end + endStr.length, result.length);

            return resultValue;
        };
    });
})

.config(function($provide){
    $provide.decorator("$sanitize", function($delegate, $log, $rootScope){
        return function(text, target){

            var result = $delegate(text, target);

            var startStr = "[vk=";
            var endStr = "]";

            var start = result.indexOf(startStr);

            if (start == -1) {
                return result;
            }

            var end = result.indexOf(endStr, start);
            var str = result.substring(start + startStr.length, end);

            var params = str.split(',');

            var ownerId = params[0];
            var postId = params[1];
            var postHash = params[2];

            var element = '<div id="vk_post_' + ownerId + '_' + postId + '"></div>';

            $rootScope.drawPost({"ownerId": ownerId, "postId": postId, "postHash": postHash});

            var resultValue = result.substring(0, start) + element + result.substring(end + endStr.length, result.length);
            return resultValue;
        };
    });
})

.run(function($rootScope, $location, $timeout, $sce) {
    $rootScope.location = $location;

    $rootScope.drawPost = function(item) {
        $timeout(function(){
            VK.Widgets.Post("vk_post_" + item.ownerId + "_" + item.postId, item.ownerId, item.postId, item.postHash, {});
        }, 100);
    };

    $rootScope.trustAsHtml = function(text) {
        if (!text) {
            return text;
        }

        return $sce.trustAsHtml(text);
    };
})

.config(function (ezfbProvider) {
  ezfbProvider.setLocale('ru_RU');
})

.config(function (ezfbProvider, ENV) {
  ezfbProvider.setInitParams({
    // This is my FB app id for plunker demo app
    appId: ENV['facebook-app_id'],

    // Module default is `v2.0`.
    // If you want to use Facebook platform `v2.3`, you'll have to add the following parameter.
    // https://developers.facebook.com/docs/javascript/reference/FB.init
    version: 'v2.3'
  });
})

.config(function (ENV) {
  VK.init({apiId: ENV["vk-app_id"], onlyWidgets: true});
})

.filter('escape', function() {
  return function(text) {
    if (!text) {
        return text;
    }

    return window.encodeURIComponent(text);
  }
})

.filter('md', function($sanitize) {
  var converter = new Showdown.converter();
  return function(text, isHtml) {
      if (!text || isHtml) {
          return text;
      }

    return $sanitize(converter.makeHtml(text));
  };
})

.directive('selectOnClick', ['$window', function ($window) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            element.on('click', function () {
                if (!$window.getSelection().toString()) {
                    // Required for mobile Safari
                    this.setSelectionRange(0, this.value.length)
                }
            });
        }
    };
}])

.config(['markdownConverterProvider', function (markdownConverterProvider) {
    // options to be passed to Showdown
    // see: https://github.com/coreyti/showdown#extensions
    markdownConverterProvider.config({
        extensions: ['table']
    });
}]);