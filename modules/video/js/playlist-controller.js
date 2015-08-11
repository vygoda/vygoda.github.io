'use strict';

angular.module('vygoda-video')

.controller('PlaylistCtrl',
    function ($scope, $routeParams, $sce, ENV, Playlist) {
        $scope.getTrusted = function(playlistId) {
            return $sce.trustAsResourceUrl('https://www.youtube.com/embed/videoseries?list=' + playlistId);
        };

        Playlist.query({}, function(successData) {
            //Workaround to remove useless playlist
            for (var i = 0; i < successData.items.length; i++) {
                if (successData.items[i].snippet.title == 'ОНАПТ') {
                    successData.items.splice(i, 1);
                    break;
                }
            }

            $scope.playlists = successData;
        });
    }
);