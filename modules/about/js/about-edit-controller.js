'use strict';

angular.module('vygoda-about')

.controller('AboutEditCtrl',
    function ($scope, $routeParams, $timeout, $location, About, Notification) {
        $scope.preview = true;

        $scope.aboutId = $routeParams.aboutId;

        if ($scope.aboutId) {
            $scope.about = About.get({aboutId: $scope.aboutId});
        } else {
            $scope.about = {order: 9007199254740992};
        }

        var onError = function (error) {
            Notification.error({message: error.data.message, delay: 3000});
        };

        $scope.save = function () {
            var onSuccess = function (data) {
                Notification.success({message: 'Сохранено', delay: 2000});

                $timeout(function() {
                    $location.path('/edit/about/' + data.objectId);
                }, 1000);
            };

            if ($scope.aboutId) {
                About.update({"aboutId": $scope.aboutId}, $scope.about, onSuccess, onError);
            } else {
                About.save($scope.about, onSuccess, onError);
            }
        };

        $scope.delete = function() {
            var onSuccess = function (data) {
                Notification.success({message: 'Удалено', delay: 2000});

                $timeout(function() {
                    $location.path('/about');
                }, 1000);
            };

            About.delete({"aboutId": $scope.aboutId}, onSuccess, onError);
        };
    }
);