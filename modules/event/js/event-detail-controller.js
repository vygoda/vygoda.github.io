'use strict';

angular.module('vygoda-news')

.controller('EventDetailCtrl',
    function ($scope, $routeParams, $location, Event) {
        $scope.detailed = true;

        Event.get({where: "(prettyTitle='" + $routeParams.eventId + "')OR(objectId='" + $routeParams.eventId + "')"}, function(successData) {
            $scope.event = successData.data[0];
        });
        //$scope.event = Event.get({eventId: $routeParams.eventId});

        VK.Widgets.Comments('vk_comments', {}, $location.path().hashCode());
    }
);