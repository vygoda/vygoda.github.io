'use strict';

/* Controllers */

var dkControllers = angular.module('dkControllers', []);

dkControllers.controller('EventListCtrl',
    function ($scope, Event) {
        $scope.save = Event.save;
        $scope.events = Event.query();
    });

dkControllers.controller('EventDetailCtrl',
    function ($scope, $routeParams, Event) {
        $scope.phone = Event.get({eventId: $routeParams.eventId});
    });

dkControllers.controller('UserCtrl', function ($rootScope, $scope, $http, $window, ENV, AuthService) {
    $scope.user = {login: '', password: ''};

    if (ENV.login && ENV.password) {
        $scope.user.login = ENV.login;
        $scope.user.password = ENV.password;
    }

    $rootScope.isAuthenticated = false;

    if ($window.sessionStorage["user-token"]) {
        $rootScope.isAuthenticated = true;
        $scope.wellcome = "Hi, " + $window.sessionStorage.userData.name;
    }

    $scope.submit = function () {
        AuthService.login($scope.user,
            function (successData) {
                $rootScope.isAuthenticated = true;
                $scope.wellcome = "Hi, " + successData.name;
            },
            function (errorData) {
                $scope.wellcome = '';
                $rootScope.isAuthenticated = false;
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
