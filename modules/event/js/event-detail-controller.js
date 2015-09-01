'use strict';

angular.module('vygoda-event')

.controller('EventDetailCtrl',
    function ($scope, $routeParams, $location, Event) {
        $scope.detailed = true;

//        Event.get({where: "title LIKE '" + $routeParams.eventTitle.replace(/'/g, "_").replace(/"/g, "_") + "'"}, function(successData) {
//            $scope.event = successData.data[0];
//        });
        $scope.event = Event.get({eventId: $routeParams.eventId});

        VK.Widgets.Comments('vk_comments', {}, $location.path().hashCode());
    }
);