'use strict';

angular.module('vygoda-event')

.controller('EventListCtrl',
    function ($scope, $routeParams, Event, $location, $timeout, ENV) {
        $scope.pageSize = ENV.pageSize;

        $scope.togglePin = function(event, pinedEvents) {
            pinedEvents.forEach(function(item, i, arr) {
                item.pined = false;
            });

            event.pined = !event.pined;

            Event.update({"eventId": event.eventId}, event);

            Event.query({where: "pined=true"}, function(successData) {
                successData.data.forEach(function(item, i, arr) {
                    item.pined = false;

                    Event.update({"eventId": item.eventId}, item);
                });
            });
        };

       var calculateOffset = function(page) {
            if (!page) {
                return 0;
            }

            return (page - 1) * $scope.pageSize;
        };

        var queryItems = function() {
            $scope.events = Event.query({offset: calculateOffset($routeParams.page), where: "pined=false OR pined IS NULL"}, function(response) {
                $scope.totalCount = response.totalObjects;
                $scope.page = $routeParams.page;
            });

            $scope.pinedEvents = Event.query({where: "pined=true"});
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