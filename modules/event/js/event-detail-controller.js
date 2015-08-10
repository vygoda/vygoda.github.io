'use strict';

angular.module('vygoda-event')

.controller('EventDetailCtrl',
    function ($scope, $routeParams, $location, Event) {
        $scope.detailed = true;

        Event.get({where: "title='" + $routeParams.eventTitle + "'"}, function(successData) {
            $scope.event = successData.data[0];
        });

        VK.Widgets.Comments('vk_comments', {}, $location.path().hashCode());
    }
);