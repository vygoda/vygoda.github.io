'use strict';

angular.module('vygoda-event')

.controller('EventDetailCtrl',
    function ($scope, $routeParams, $location, Event) {
        $scope.detailed = true;

        $scope.event = Event.get({eventId: $routeParams.eventId});

        VK.Widgets.Comments('vk_comments', {}, $location.path().hashCode());
    }
);