'use strict';

angular.module('vygoda-feedback')

.controller('FeedbackListCtrl', function ($scope, $routeParams, $timeout, $location, ENV, Feedback) {
    $scope.pageSize = ENV["feedback-pageSize"];
    $scope.isExpanded = [];

    $scope.change = function(feedback) {
        Feedback.update({feedbackId: feedback.objectId}, feedback);
    };

    var calculateOffset = function(page) {
        return !page ? 0 : (page - 1) * $scope.pageSize;
    };

    $scope.pageChanged = function(page) {
         $location.path('/feedback-list/' + page);
    };

    $scope.feedbacks = Feedback.query({pageSize: $scope.pageSize, offset: calculateOffset($routeParams.page)},
        function(response) {
            $scope.totalCount = response.totalObjects;
            $scope.page = $routeParams.page || 1;
        }
    );
});