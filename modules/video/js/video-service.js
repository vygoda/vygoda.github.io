'use strict';

angular.module('vygoda-video')

.factory('Video',
    function ($resource, $http, ENV) {
        return $resource('https://www.googleapis.com/youtube/v3/playlistItems/', {}, {
            query: { method: 'GET', params: {key: ENV["google-key"], part: "snippet", maxResults: ENV["pageSize"]}, isArray: false }
        });
    }
)

.factory('Playlist',
    function ($resource, $http, ENV) {
        return $resource('https://www.googleapis.com/youtube/v3/playlists/', {}, {
            query: { method: 'GET', params: {key: ENV["google-key"], channelId: ENV["youtube-channelId"], part: "snippet", maxResults: 50}, isArray: false }
        });
    }
)

.factory('SearchVideo',
    function ($resource, $http, ENV) {
        return $resource('https://www.googleapis.com/youtube/v3/search', {}, {
            query: { method: 'GET', params: {key: ENV["google-key"], part: "snippet", channelId: ENV["youtube-channelId"], type: "video", maxResults: 20}, isArray: false }
        });
    }
);
