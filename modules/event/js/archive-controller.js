'use strict';

angular.module('vygoda-news')

.controller('ArchiveCtrl',
    function ($scope, $routeParams, $location, Event) {
        Event.query({pageSize: 1, sortBy: "eventDate"}, function(successData) {
            if (successData.data.length == 0) {
                return;
            }

            var utcSeconds = successData.data[0].eventDate / 1000;

            var dateObj = new Date(0); // The 0 there is the key, which sets the date to the epoch
            dateObj.setUTCSeconds(utcSeconds);

            var firstDate = extractYearMonth(dateObj);
            var endDate = extractYearMonth(new Date());

            $scope.archives = generateArchive(firstDate, endDate);
        });
    }
);