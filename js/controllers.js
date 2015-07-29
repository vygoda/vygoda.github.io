'use strict';

/* Controllers */

var dkControllers = angular.module('dkControllers', []);

dkControllers.controller('EventListCtrl',
    function ($scope, $routeParams, Event, $location, $timeout, ENV) {
        $scope.save = Event.save;

        $scope.pageSize = ENV.pageSize;

       var calculateOffset = function(page) {
            if (!page) {
                return 0;
            }

            return (page - 1) * $scope.pageSize;
        };

        var queryItems = function() {
            $scope.events = Event.query({offset: calculateOffset($routeParams.page)}, function(response) {
                $scope.totalCount = response.totalObjects;
                $scope.page = $routeParams.page;
            });
        };

        $scope.pageChanged = function() {
            $routeParams.page = $scope.page;
                    console.log($scope.page);
                    console.log($routeParams.page);

             $timeout(function() {
                        $location.path('/events/' + $scope.page, false);
                        queryItems();
             }, 50);

        };

        queryItems();
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

dkControllers.controller('VideoListCtrl',
    function ($scope, Video) {
        $scope.videos = Video.query();
    });

dkControllers.controller('CollectionListCtrl',
    function ($scope, $routeParams, PhotoCollection, ENV) {
        $scope.user_id = ENV["flickr-user_id"];

        $scope.collections = PhotoCollection.query();
    });

dkControllers.controller('AlbumListCtrl',
    function ($scope, PhotoSet, photoSetIds, ENV) {
        $scope.user_id = ENV["flickr-user_id"];

        $scope.photoSetIds = photoSetIds;
        $scope.photoSets = PhotoSet.query();
    });

dkControllers.controller('DocumentListCtrl',
    function ($scope, $sce, cfpLoadingBar, ENV) {
                $scope.onLoaded = function() {
                    cfpLoadingBar.complete();
                };

        cfpLoadingBar.start();

        $scope.folder_url = $sce.trustAsResourceUrl("https://drive.google.com/embeddedfolderview?id=" + ENV["googleDrive-folder_id"] + "#list");
    });

dkControllers.controller('AboutCtrl',
    function ($scope, $routeParams, $location, $document, $timeout, About, ENV) {
        $scope.page = $routeParams.page;

        $scope.abouts = About.query();

        $scope.goto = function(page) {
            $location.path('/about/' + page, false);
            $scope.page = page;

            var duration = 500;

            var offset = 30; //pixels; adjust for floating menu, context etc
                //Scroll to #some-id with 30 px "padding"
                //Note: Use this in a directive, not with document.getElementById

            //ToDo: add handler instead of delay
            $timeout(function() {
                var someElement = angular.element(document.getElementById(page));
                $document.scrollToElement(someElement, offset, duration);
            }, 500);

        };

        if ($scope.page) {
            $scope.goto($scope.page);
        }

        var changeOrder = function(about, abouts, up) {
            abouts.sort(function(a, b) {
                          if (a.order < b.order) {
                            return -1;
                          }
                          if (a.order > b.order) {
                            return 1;
                          }
                          // a должно быть равным b
                          return 0;
                        });

            var index = 0;
             abouts.forEach(function(entry) {
                 entry.order = index++;
             });

            index = abouts.indexOf(about);

            if (up && index > 0) {
                    var tmp = abouts[index - 1].order;
                    abouts[index - 1].order = about.order;
                    about.order = tmp;
            } else if (!up && index < abouts.length - 1) {
                    var tmp = abouts[index + 1].order;
                    abouts[index + 1].order = about.order;
                    about.order = tmp;
            }

            abouts.forEach(function(entry) {
                About.update({aboutId: entry.objectId}, {order: entry.order});
            });
        };

        $scope.orderUp = function(about, abouts) {
            changeOrder(about, abouts, true);
        };

        $scope.orderDown = function(about, abouts) {
            changeOrder(about, abouts, false);
        };
    });

dkControllers.controller('AboutEditCtrl',
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
    });

dkControllers.controller('ContactsCtrl', function ($scope, ENV) {
$scope.map = {
            center: {
                    latitude: 46.619753,
                    longitude: 30.395090
            },
            zoom: 15,
            options: {mapTypeId: google.maps.MapTypeId.HYBRID },
            marker: {
                id:0,
                coords: {
                    latitude: 46.619663,
                    longitude: 30.394960
                },
                options: {
                    icon: {
                        origin: new google.maps.Point(0,0),
                        scaledSize: new google.maps.Size(37, 37),
                        url: 'http://google-maps-icons.googlecode.com/files/cityhall-admin.png'
                    }
                }
            }
        };
});

dkControllers.controller('PostersCtrl', function ($scope, Photos, ENV) {
    $scope.myInterval = 5000;

    $scope.slides = Photos.query({photoset_id: ENV["flickr-posters_album_id"]});
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
