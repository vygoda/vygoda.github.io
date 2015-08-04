'use strict';

angular.module('vygoda-event')

.controller('EventListCtrl',
    function ($scope, $routeParams, Event, $location, $timeout, ENV) {
        $scope.pageSize = ENV.pageSize;

       var calculateOffset = function(page) {
            if (!page) {
                return 0;
            }

            return (page - 1) * $scope.pageSize;
        };

        var queryItems = function() {
            $scope.events = Event.query({offset: calculateOffset($routeParams.page)}, function(response) {
                $scope.totalCount = response.totalObjects;
                $scope.page = $routeParams.page;
            });
        };

        $scope.pageChanged = function() {
            $routeParams.page = $scope.page;
                    console.log($scope.page);
                    console.log($routeParams.page);

             $timeout(function() {
                        $location.path('/events/' + $scope.page, false);
                        queryItems();
             }, 50);

        };

        queryItems();
    }
);