'use strict';

angular.module('vygoda-video')

.factory('Video',
    function ($resource, $http, ENV) {
        return $resource('https://www.googleapis.com/youtube/v3/playlistItems/', {}, {
            query: { method: 'GET', params: {key: ENV["youtube-key"], part: "snippet", maxResults: ENV["pageSize"]}, isArray: false }
        });
    }
)

.factory('Playlist',
    function ($resource, $http, ENV) {
        return $resource('https://www.googleapis.com/youtube/v3/playlists/', {}, {
            query: { method: 'GET', params: {key: ENV["youtube-key"], part: "snippet", maxResults: 50}, isArray: false }
        });
    }
);
