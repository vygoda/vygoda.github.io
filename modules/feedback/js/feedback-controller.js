'use strict';

angular.module('vygoda-feedback')

.controller('FeedbackCtrl', function ($scope, ENV, Feedback) {
    $scope.feedback = {};
    $scope.sent = false;

    $scope.save = function() {
        Feedback.create($scope.feedback, function() {
            $scope.sent = true;
     })};

});