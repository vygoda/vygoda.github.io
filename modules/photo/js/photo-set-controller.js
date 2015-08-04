'use strict';

angular.module('vygoda-photo')

.controller('PhotoSetCtrl',
    function ($scope, $routeParams, PhotoSet, PhotoCollection, photoSetIds, ENV) {
        $scope.user_id = ENV["flickr-user_id"];

        PhotoCollection.query({}, function(successData) {
            console.log(successData);
            successData.collections.collection.forEach(function(item, i, arr) {
                    if (item.id == $routeParams.collectionId) {
                        $scope.collectionTitle = item.title;
                    }
                });
        });

        $scope.photoSetIds = photoSetIds;
        $scope.photoSets = PhotoSet.query();
    }
);