'use strict';

/* Directives */

angular.module('vygoda-video')

.directive('youtube', function() {
    return {
        templateUrl: 'modules/video/view/youtube-thumbnail.html',
        scope:{
            videoId:'@youtube'
        }
    };
});
