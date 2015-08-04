'use strict';

angular.module('vygoda-photo')

.controller('PhotoCollectionCtrl',
    function ($scope, $routeParams, PhotoCollection, ENV) {
        $scope.user_id = ENV["flickr-user_id"];

        $scope.collections = PhotoCollection.query();
    }
);