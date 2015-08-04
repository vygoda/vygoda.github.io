'use strict';

angular.module('vygoda-photo')

.factory('PhotoCollection',
    function ($resource, $http, ENV) {
        return $resource(ENV['flickr-api_url'], {}, {
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
    }
);