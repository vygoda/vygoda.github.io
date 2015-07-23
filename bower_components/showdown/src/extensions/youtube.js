/*  Youtube Extension
 ^http://www.youtube.com/watch?v=0mmx68VmTEo  ->
 <iframe  src=\"//www.youtube.com/embed/0mmx68VmTEo?rel=0\"\nframeborder=\"0\" allowfullscreen></iframe>
 */

(function() {
    var youtube = function(converter) {
        return [
            {
                type: 'lang',
                regex: '\\^\\^([\\S]+)',
                replace: function(match, url) {
                    var m, video_id, youtube;
                    youtube = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
                    if (youtube.test(url)) {
                        m = url.match(youtube);
                        if (m && m[7].length === 11) {
                            video_id = m[7];
                            return '<div class="play-button-container">' +
                                '<a target="_blank" href="http://www.youtube.com/watch?v=' + video_id + '" class="play-button-link">' +
                                    '<img class="youtube-thumbnail" src="http://img.youtube.com/vi/' + video_id + '/mqdefault.jpg" />' +
                                    '<img class="play-button" alt="" src="img/youtube_play_64x64.png" />' +
                                '</a>' +
                            '</div>';
                        } else {
                            return match;
                        }
                    } else {
                        return match;
                    }
                }
            }
        ];
    };

    // Client-side export
    if (typeof window !== 'undefined' && window.Showdown && window.Showdown.extensions) { window.Showdown.extensions.youtube = youtube; }
    // Server-side export
    if (typeof module !== 'undefined') module.exports = youtube;

}());