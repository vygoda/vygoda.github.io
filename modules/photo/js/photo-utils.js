var transformFlickResponse = function(response) {
    // ToDo: remove workaround jsonFlickrApi({...});
    return angular.fromJson(response.substring(14, response.length - 1));
};
