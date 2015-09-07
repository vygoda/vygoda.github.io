'use strict';

angular.module('vygoda-map')

.controller('MapCtrl', function ($scope, ENV) {
$scope.map = {
            center: {
                    latitude: 46.613196,
                    longitude: 30.398027
            },
            zoom: 15,
            options: {mapTypeId: google.maps.MapTypeId.HYBRID },
            marker: {
                id:0,
                coords: {
                    latitude: 46.613196,
                    longitude: 30.398027
                }//,
//                options: {
//                    icon: {
//                        origin: new google.maps.Point(0,0),
//                        scaledSize: new google.maps.Size(37, 37),
//                        url: 'http://google-maps-icons.googlecode.com/files/cityhall-admin.png'
//                    }
//                }
            }
        };
});