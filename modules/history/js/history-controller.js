'use strict';

angular.module('vygoda-history')

.controller('HistoryCtrl', function ($scope, $routeParams, Event, ENV) {
    var maxDaysPerMonth = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

    $scope.currentMonth = parseInt($routeParams.month) || new Date().getMonth() + 1;

    $scope.previousMonth = $scope.currentMonth == 1 ? 12 : $scope.currentMonth - 1;
    $scope.nextMonth = $scope.currentMonth == 12 ? 1 : $scope.currentMonth + 1;


    $scope.month = months[$scope.currentMonth - 1];
    var days = [];
    for(var i = 0; i < maxDaysPerMonth[$scope.currentMonth - 1]; i++) {
        days.push({day: i + 1, events: []});
    }
    var pageSize = 20;
    var totalCount = 0;

    var requestEvents = function(offset) {
        Event.query({where: "(month=" + $scope.currentMonth + ")AND(history=true)", pageSize: pageSize, sortBy: "day", offset: offset},
        function(successData) {
            for (var index = 0; index < successData.data.length; ++index) {
                var item = successData.data[index];
                days[item.day - 1].events.push(item);
            }

            totalCount += successData.data.length;

            if (totalCount < successData.totalObjects) {
                requestEvents(successData.offset + pageSize);
            } else {
                $scope.days = days;
            }
        });
    };

    requestEvents(0);
});