'use strict';

angular.module('vygoda-document')

.controller('DocumentsCtrl',
    function ($scope, $sce, cfpLoadingBar, ENV) {
                $scope.onLoaded = function() {
                    cfpLoadingBar.complete();
                };

        cfpLoadingBar.start();

        $scope.folder_url = $sce.trustAsResourceUrl("https://drive.google.com/embeddedfolderview?id=" + ENV["googleDrive-folder_id"] + "#list");
    }
);