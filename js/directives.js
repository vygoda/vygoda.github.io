'use strict';

/* Directives */

phonecatApp.directive('youtube', function() {
    return {
        templateUrl: 'partials/youtube-thumbnail.html',
        scope:{
            videoId:'@youtube'
        }
    };
});
