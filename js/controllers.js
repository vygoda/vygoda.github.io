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
        $scope.detailed = true;

        $scope.event = Event.get({eventId: $routeParams.eventId});
    });

dkControllers.controller('EventEditCtrl',
    function ($scope, $routeParams, $timeout, $location, $localStorage, Event, Notification) {
        $scope.preview = true;
        $scope.detailed = true;

        $scope.eventId = $routeParams.eventId;

        if ($scope.eventId) {
            $scope.event = Event.get({eventId: $scope.eventId});
        } else {
            $scope.event = {author: $localStorage.userData.name};
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
    });

dkControllers.controller('PhotoListCtrl',
    function($scope, $rootScope, $routeParams, $q, Album) {
        $scope.photos = Album.photos({}, function(response){
            $scope.photos = response.resources;
        });
    });

dkControllers.controller('PhotoUploadCtrl',
    function($scope, $rootScope, $routeParams, $location, $upload) {
        $scope.$watch('files', function() {
            if (!$scope.files) return;
            $scope.files.forEach(function(file){
                $scope.upload = $upload.upload({
                    url: "https://api.cloudinary.com/v1_1/" + $.cloudinary.config().cloud_name + "/upload",
                    data: {upload_preset: $.cloudinary.config().upload_preset, tags: 'myphotoalbum', context:'photo=' + $scope.title},
                    file: file
                }).progress(function (e) {
                    file.progress = Math.round((e.loaded * 100.0) / e.total);
                    file.status = "Uploading... " + file.progress + "%";
                    if(!$scope.$$phase) {
                        $scope.$apply();
                    }
                }).success(function (data, status, headers, config) {
                    $rootScope.photos = $rootScope.photos || [];
                    data.context = {custom: {photo: $scope.title}};
                    file.result = data;
                    $rootScope.photos.push(data);
                    if(!$scope.$$phase) {
                        $scope.$apply();
                    }
                });
            });
        });

        /* Modify the look and fill of the dropzone when files are being dragged over it */
        $scope.dragOverClass = function($event) {
            var items = $event.dataTransfer.items;
            var hasFile = false;
            if (items != null) {
                for (var i = 0 ; i < items.length; i++) {
                    if (items[i].kind == 'file') {
                        hasFile = true;
                        break;
                    }
                }
            } else {
                hasFile = true;
            }
            return hasFile ? "dragover" : "dragover-err";
        };
    });

dkControllers.controller('UserCtrl', function ($rootScope, $scope, $http, $localStorage, ENV, AuthService) {
    $scope.user = {login: '', password: ''};

    if (ENV.login && ENV.password) {
        $scope.user.login = ENV.login;
        $scope.user.password = ENV.password;
    }

    $rootScope.isAuthenticated = false;

    if ($localStorage["user-token"]) {
        $rootScope.isAuthenticated = true;
        $scope.wellcome = "Hi, " + $localStorage.userData.name;
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
