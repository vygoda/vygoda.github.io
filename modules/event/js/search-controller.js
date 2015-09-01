'use strict';

angular.module('vygoda-event')

.controller('SearchFormCtrl',
    function ($scope, $routeParams, $location) {
        $scope.query = $routeParams.query;

        $scope.submit = function() {
            if (!$scope.query.length) {
                return;
            }

            var query = $scope.query;
            if (!$scope.holdValue) {
                $scope.query = "";
            }

            $location.path('/search/' + query)
        };
    }
)

.controller('SearchCtrl',
    function ($scope, $routeParams, $location, Event) {
        $scope.holdValue = true;
        $scope.query = $routeParams.query;

        var queryString = "%" + $scope.query.replace(/'/g, "_").replace(/"/g, "_").replace(/%/g, "_") + "%";

        $scope.events = Event.query({where: "(title LIKE '" + queryString + "')" + "OR" + "(summary LIKE '" + queryString + "')" + "OR" + "(content LIKE '" + queryString + "')", pageSize: 100});
    }
);