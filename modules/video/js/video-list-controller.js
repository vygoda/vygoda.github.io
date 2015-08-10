'use strict';

angular.module('vygoda-video')

.controller('VideoListCtrl',
    function ($scope, $routeParams, $sce, Video, Playlist) {
        $scope.playlistId = $routeParams.playlistId;
        $scope.getTrusted = function(videoId) {
            return $sce.trustAsResourceUrl('http://www.youtube.com/embed/' + videoId + '?autoplay=0');
        };

        Playlist.query({id: $scope.playlistId}, function(successData) {
            successData.items.forEach(function(item, i, arr) {
                $scope.playlistTitle = item.snippet.title;
            });
        });

        $scope.videos = Video.query({playlistId: $routeParams.playlistId, pageToken: $routeParams.pageToken});
    }
);