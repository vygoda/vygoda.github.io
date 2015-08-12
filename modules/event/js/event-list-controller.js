'use strict';

angular.module('vygoda-event')

.controller('EventListCtrl',
    function ($scope, $routeParams, Event, $location, $timeout, ENV) {
        $scope.pageSize = ENV.pageSize;

        $scope.year = $routeParams.year;
        $scope.month = $routeParams.month;
        $scope.monthName = $routeParams.month ? months[$routeParams.month - 1] : "";

        $scope.isArchive = $scope.year && $scope.month;

        $scope.togglePin = function(event, pinedEvents) {
            pinedEvents.forEach(function(item, i, arr) {
                if (item === event) {
                    return;
                }

                item.pined = false;
            });

            event.pined = !event.pined;

            Event.update({"eventId": event.eventId}, event);

            Event.query({where: "pined=true"}, function(successData) {
                successData.data.forEach(function(item, i, arr) {
                    item.pined = false;

                    Event.update({"eventId": item.eventId}, item);
                });
            });
        };

       var calculateOffset = function(page) {
            if (!page) {
                return 0;
            }

            return (page - 1) * $scope.pageSize;
        };

        var generateDates = function(year, month) {
            year = parseInt(year);
            month = parseInt(month);

            var nextYear = year;
            var nextMonth = month + 1;

            //parametrize
            var threeMonth = month - 1;
            var threeYear = year;

            if (month == 12) {
                nextMonth = 1;
                nextYear++;
            }

            if (threeMonth <= 0) {
                threeYear--;
                threeMonth += 12;
            }

            var dateFormat = function(year, month) {
                var monthStr = month < 10 ? '0' + month : month;

                return year + "" + monthStr + "01000000";
            };

            return {startDate: dateFormat(year, month), endDate: dateFormat(nextYear, nextMonth), threeMonths: dateFormat(threeYear, threeMonth)};
        };

        var queryItems = function() {
            var whereStr = "((pined=false)OR(pined IS NULL))";
            if ($scope.isArchive) {
                var dates = generateDates($scope.year, $scope.month);

                whereStr = whereStr + "AND(eventDate>=" + dates.startDate + ")AND(eventDate<" + dates.endDate + ")";
            } else {
                var currentDate = extractYearMonth(new Date());
                var dates = generateDates(currentDate.year, currentDate.month);

                whereStr += "AND(eventDate>=" + dates.threeMonths + ")";
            }

            console.log(whereStr);

            $scope.events = Event.query({offset: calculateOffset($routeParams.page), where: whereStr}, function(response) {
                $scope.totalCount = response.totalObjects;
                $scope.page = $routeParams.page;
            });

            $scope.pinedEvents = Event.query({where: "pined=true"});
        };

        $scope.pageChanged = function() {
            $routeParams.page = $scope.page;

             $timeout(function() {
                        if ($scope.isArchive) {
                            $location.path('/events/' + $scope.year + '/' + $scope.month + '/page/' + $scope.page, false);
                        } else {
                            $location.path('/events/' + $scope.page, false);
                        }

                        queryItems();
             }, 50);

        };

        queryItems();
    }
);