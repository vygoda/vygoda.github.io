'use strict';

angular.module('vygoda-photo')

.controller('PostersCtrl', function ($scope, Photos, ENV) {
    $scope.myInterval = 5000;

    $scope.slides = Photos.query({photoset_id: ENV["flickr-posters_album_id"]});
    }
);