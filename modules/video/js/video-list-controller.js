'use strict';

angular.module('vygoda-video')

.controller('VideoListCtrl',
    function ($scope, $routeParams, $sce, Video, Playlist) {
        $scope.playlistTitle = $routeParams.playlistTitle;
        $scope.getTrusted = function(videoId) {
            return $sce.trustAsResourceUrl('http://www.youtube.com/embed/' + videoId + '?autoplay=0');
        };

        Playlist.query({}, function(successData) {
            successData.items.forEach(function(item, i, arr) {
                if ($scope.playlistTitle == item.snippet.title) {
                    $scope.playlistId = item.id;

                    $scope.videos = Video.query({playlistId: $scope.playlistId, pageToken: $routeParams.pageToken});
                }
            });
        });
    }
);