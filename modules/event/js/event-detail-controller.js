'use strict';

angular.module('vygoda-event')

.controller('EventDetailCtrl',
    function ($scope, $routeParams, Event) {
        $scope.detailed = true;

        $scope.event = Event.get({eventId: $routeParams.eventId});
    }
);