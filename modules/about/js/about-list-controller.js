'use strict';

angular.module('vygoda-about')

.controller('AboutListCtrl',
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
    }
);