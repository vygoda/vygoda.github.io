'use strict';

/* Controllers */

var dkControllers = angular.module('dkControllers', []);

dkControllers.controller('EventListCtrl',
    function ($scope, Phone) {
        $scope.save = Phone.save;
        $scope.phones = Phone.query();
        $scope.orderProp = 'age';
    });

dkControllers.controller('EventDetailCtrl',
    function ($scope, $routeParams, Phone) {
        $scope.phone = Phone.get({eventId: $routeParams.eventId}, function (phone) {
            $scope.mainImageUrl = phone.imageUrl;
        });

        $scope.setImage = function (imageUrl) {
            $scope.mainImageUrl = imageUrl;
        }
    });

dkControllers.controller('UserCtrl', function ($rootScope, $scope, $http, $window, ENV, AuthService) {
    $scope.user = {login: '', password: ''};

    if (ENV.login && ENV.password) {
        $scope.user.login = ENV.login;
        $scope.user.password = ENV.password;
    }

    $rootScope.isAuthenticated = false;
    $scope.message = '';

    if ($window.sessionStorage["user-token"]) {
        $rootScope.isAuthenticated = true;
    }

    $scope.submit = function () {
        AuthService.login($scope.user,
            function (successData) {
                $rootScope.isAuthenticated = true;
                $scope.wellcome = "Hi, " + successData.name;
                $scope.message = '';
            },
            function (errorData) {
                $scope.wellcome = '';
                $rootScope.isAuthenticated = false;
                $scope.message = errorData.message;
            });
    };

    $scope.logout = function () {
        AuthService.logout(
            function () {
                $rootScope.isAuthenticated = false;
                $scope.wellcome = '';
                $scope.message = "Logged out!";
            });
    };
});
