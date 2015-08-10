'use strict';

angular.module('vygoda-video')

.controller('PlaylistCtrl',
    function ($scope, $routeParams, $sce, ENV, Playlist) {
        $scope.getTrusted = function(playlistId) {
            return $sce.trustAsResourceUrl('https://www.youtube.com/embed/videoseries?list=' + playlistId);
        };

        $scope.playlists = Playlist.query({channelId: ENV["youtube-channelId"]});
    }
);