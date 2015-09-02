'use strict';

angular.module('vygoda-photo')

.factory('Photos',
    function ($resource, $http, ENV) {
        return $resource(ENV['flickr-api_url'], {}, {
            query: { method: 'GET', params: {method: "flickr.photosets.getPhotos", api_key: ENV["flickr-api_key"], user_id: ENV["flickr-user_id"], format: "json", per_page: 500}, isArray: true, transformResponse: function(data) {
                var rawObject = transformFlickResponse(data);

                var urls = [];
                rawObject.photoset.photo.forEach(function(photo, i, arr) {
                  urls.push({image: "https://farm" + photo.farm + ".staticflickr.com/" + photo.server + "/" + photo.id + "_" + photo.secret + "_z.jpg"});
                });

                return urls;
            } }
        });
    }
)

.factory('SearchPhotos',
    function ($resource, $http, ENV) {
        return $resource(ENV['flickr-api_url'], {}, {
            query: { method: 'GET', params: {method: "flickr.photos.search", api_key: ENV["flickr-api_key"], user_id: ENV["flickr-user_id"], content_type: 7, extras: "url_sq,description,date_upload", format: "json", per_page: 500}, isArray: false, transformResponse: transformFlickResponse}
        });
    });



////https://www.flickr.com/photos/130413297@N03/16377997373/in/album-72157651695647255/
//dkServices.factory('PhotoDetail',
//    function ($resource, $http, ENV) {
//        return $resource('https://api.flickr.com/services/rest/', {}, {
//            query: { method: 'GET', params: {method: "flickr.photos.getSizes", api_key: ENV["flickr-api_key"], format: "json"}, isArray: false, transformResponse: transformFlickResponse}
//        });
//    });