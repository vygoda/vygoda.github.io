'use strict';

angular.module('vygoda-photo')

.controller('PhotoSetCtrl',
    function ($scope, PhotoSet, photoSetIds, ENV) {
        $scope.user_id = ENV["flickr-user_id"];

        $scope.photoSetIds = photoSetIds;
        $scope.photoSets = PhotoSet.query();
    }
);