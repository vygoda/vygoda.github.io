'use strict';

angular.module('vygoda-video')

.controller('VideoListCtrl',
    function ($scope, Video) {
        $scope.videos = Video.query();
    }
);