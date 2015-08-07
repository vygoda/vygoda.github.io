'use strict';

angular.module('vygoda-video')

.factory('Video',
    function ($resource, $http, ENV) {
        return $resource('https://www.googleapis.com/youtube/v3/playlistItems/', {}, {
            query: { method: 'GET', params: {key: ENV["youtube-key"], playlistId: ENV["youtube-playlistId"], part: "snippet", maxResults: ENV["pageSize"]}, isArray: false }
        });
    }
);