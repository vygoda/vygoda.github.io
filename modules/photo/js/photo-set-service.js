'use strict';

angular.module('vygoda-photo')

//ToDo: add pagination. Current limitation is 500 entries.
.factory('PhotoSet',
    function ($resource, $http, ENV) {
        return $resource(ENV['flickr-api_url'], {}, {
            query: { method: 'GET', params: {method: "flickr.photosets.getList", api_key: ENV["flickr-api_key"], user_id: ENV["flickr-user_id"], format: "json", per_page: 500}, isArray: false, transformResponse: transformFlickResponse }
        });
    }
)

.factory('PhotoSetInfo',
    function ($resource, $http, ENV) {
        return $resource(ENV['flickr-api_url'], {}, {
            query: { method: 'GET', params: {method: "flickr.photosets.getInfo", api_key: ENV["flickr-api_key"], user_id: ENV["flickr-user_id"], format: "json"}, isArray: false, transformResponse: transformFlickResponse }
        });
    }
);