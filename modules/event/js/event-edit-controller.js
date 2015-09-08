'use strict';

angular.module('vygoda-event')

.controller('EventEditCtrl',
    function ($scope, $routeParams, $timeout, $filter, $location, $localStorage, Event, Blogger, Notification) {
        $scope.preview = true;
        $scope.detailed = true;

        $scope.postUrl = "";

        $scope.requestBlogger = function(postUrl) {
            var a = document.createElement('a');
            a.href = postUrl;

            $scope.text = Blogger.query({path: a.pathname}, function(post) {
                $scope.eventDate = Date.parseRFC3339(post.published);
                $scope.onTimeSet($scope.eventDate);

                $scope.event.title = post.title;
                $scope.event.summary = post.content;
                $scope.event.author = post.author.displayName;
                $scope.event.isHtml = true;

                var filename = postUrl.substring(postUrl.lastIndexOf('/') + 1);
                $scope.event.prettyTitle = filename.substring(0, filename.lastIndexOf('.'));

                $timeout(function() {
                    var elementResult = $(".summary:first").find("img:first");
                    if (elementResult.length == 1) {
                        $scope.event.socialImage = elementResult[0].currentSrc;
                    }
                }, 500);

                Notification.success({message: 'Успешно импортировано', delay: 2000});
            },
            function(error) {
                console.log(error);
                Notification.error({message: 'Ошибка импорта: ' + error.status + ': ' + error.statusText, delay: 4000});
            });
        };

        $scope.eventId = $routeParams.eventId;

         $scope.$watch('eventDate', function() {
               $scope.eventDateStr = $filter('date')($scope.eventDate, "dd.MM.yyyy HH:mm:ss");
         });

        $scope.eventDate = new Date();

        $scope.onTimeSet = function (newDate, oldDate) {
            $scope.event.eventDate = newDate.getTime();
            $scope.eventDate = newDate;
        }

        if ($scope.eventId) {
            $scope.event = Event.get({eventId: $scope.eventId}, function(successData) {
                $scope.eventDate = new Date(successData.eventDate);
            });
        } else {
            $scope.event = {author: $localStorage.userData.name, eventDate: new Date().getTime(),
            day: $routeParams.day,
            month: $routeParams.month,
            year: new Date().getFullYear(),
            history: $routeParams.day && $routeParams.month};
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