'use strict';

angular.module('vygoda-event')

.controller('EventEditCtrl',
    function ($scope, $routeParams, $timeout, $location, $localStorage, Event, Notification) {
        $scope.preview = true;
        $scope.detailed = true;

        $scope.eventId = $routeParams.eventId;

        if ($scope.eventId) {
            $scope.event = Event.get({eventId: $scope.eventId});
        } else {
            $scope.event = {author: $localStorage.userData.name, eventDate: new Date().getTime()};
        }

        var onError = function (error) {
            Notification.error({message: error.data.message, delay: 3000});
        };

        $scope.save = function () {
            var onSuccess = function (data) {
                Notification.success({message: 'Сохранено', delay: 2000});

                $timeout(function() {
                    $location.path('/edit/event/' + data.objectId);
                }, 1000);
            };



            if ($scope.eventId) {
                Event.update({"eventId": $scope.eventId}, $scope.event, onSuccess, onError);
            } else {
                Event.save($scope.event, onSuccess, onError);
            }
        };

        $scope.delete = function() {
            var onSuccess = function (data) {
                Notification.success({message: 'Удалено', delay: 2000});

                $timeout(function() {
                    $location.path('/events');
                }, 1000);
            };

            Event.delete({"eventId": $scope.eventId}, onSuccess, onError);
        };
    }
);