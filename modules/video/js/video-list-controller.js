'use strict';

angular.module('vygoda-video')

.controller('VideoListCtrl',
    function ($scope, $routeParams, $sce, Video) {
        $scope.getTrusted = function(videoId) {
            return $sce.trustAsResourceUrl('http://www.youtube.com/embed/' + videoId + '?autoplay=0');
        };

        $scope.videos = Video.query({pageToken: $routeParams.pageToken});
    }
);