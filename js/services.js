'use strict';

var dkServices = angular.module('dkServices', ['ngResource']);

dkServices.factory('Event',
    function ($resource, $http, ENV) {
        return $resource(ENV.host + '/data/events/:eventId', {}, {
            query: { method: 'GET', params: {pageSize: ENV.pageSize, sortBy: "eventDate desc"}, isArray: false },
            update: { method:'PUT' }

        });
    });

dkServices.factory('About',
    function ($resource, $http, ENV) {
        return $resource(ENV.host + '/data/abouts/:aboutId', {}, {
            query: { method: 'GET', params: {}, isArray: false },
            update: { method:'PUT' }

        });
    });

//ToDo: add pagination. Current limitation is 50 entries.
dkServices.factory('Video',
    function ($resource, $http, ENV) {
        return $resource('https://www.googleapis.com/youtube/v3/playlistItems/', {}, {
            query: { method: 'GET', params: {key: ENV["youtube-key"], playlistId: ENV["youtube-playlistId"], part: "snippet", maxResults: 50}, isArray: false }
        });
    });

var transformFlickResponse = function(response) {
    // ToDo: remove workaround jsonFlickrApi({...});
    return angular.fromJson(response.substring(14, response.length - 1));
};

//ToDo: add pagination. Current limitation is 500 entries.
dkServices.factory('PhotoSet',
    function ($resource, $http, ENV) {
        return $resource('https://api.flickr.com/services/rest/', {}, {
            query: { method: 'GET', params: {method: "flickr.photosets.getList", api_key: ENV["flickr-api_key"], user_id: ENV["flickr-user_id"], format: "json", per_page: 500}, isArray: false, transformResponse: transformFlickResponse }
        });
    });

dkServices.factory('PhotoSetInfo',
    function ($resource, $http, ENV) {
        return $resource('https://api.flickr.com/services/rest/', {}, {
            query: { method: 'GET', params: {method: "flickr.photosets.getInfo", api_key: ENV["flickr-api_key"], user_id: ENV["flickr-user_id"], format: "json"}, isArray: false, transformResponse: transformFlickResponse }
        });
    });

dkServices.factory('PhotoCollection',
    function ($resource, $http, ENV) {
        return $resource('https://api.flickr.com/services/rest/', {}, {
            query: { method: 'GET', params: {method: "flickr.collections.getTree", api_key: ENV["flickr-api_key"], user_id: ENV["flickr-user_id"], format: "json"}, isArray: false, transformResponse: transformFlickResponse },
            queryPhotoSets: { method: 'GET', params: {method: "flickr.collections.getTree", api_key: ENV["flickr-api_key"], user_id: ENV["flickr-user_id"], format: "json"}, isArray: true, transformResponse: function(response) {
                var responseObject = angular.fromJson(transformFlickResponse(response));
                var setList = responseObject.collections.collection[0].set;

                var entries = [];
                for (var index in setList) {
                    entries.push(setList[index].id);
                }

                return entries;
            } }
        });
    });

dkServices.factory('Photos',
    function ($resource, $http, ENV) {
        return $resource('https://api.flickr.com/services/rest/', {}, {
            query: { method: 'GET', params: {method: "flickr.photosets.getPhotos", api_key: ENV["flickr-api_key"], user_id: ENV["flickr-user_id"], format: "json", per_page: 500}, isArray: true, transformResponse: function(data) {
                var rawObject = transformFlickResponse(data);

                var urls = [];
                rawObject.photoset.photo.forEach(function(photo, i, arr) {
                  urls.push({image: "https://farm" + photo.farm + ".staticflickr.com/" + photo.server + "/" + photo.id + "_" + photo.secret + "_z.jpg"});
                });

                return urls;
            } }
        });
    });

////https://www.flickr.com/photos/130413297@N03/16377997373/in/album-72157651695647255/
//dkServices.factory('PhotoDetail',
//    function ($resource, $http, ENV) {
//        return $resource('https://api.flickr.com/services/rest/', {}, {
//            query: { method: 'GET', params: {method: "flickr.photos.getSizes", api_key: ENV["flickr-api_key"], format: "json"}, isArray: false, transformResponse: transformFlickResponse}
//        });
//    });

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
