angular.module('app').
factory('Tracks', function($resource) {
    var Tracks = $resource('/api/:user/toptracks')

    function getTracks(username, time) {
        return Tracks.get({user: username, "time-in-week": time}).$promise
    }

    return {
        getTracks: getTracks
    }

})


angular.module('app').
factory('RandomTopArtist', function($resource) {
    var Artist = $resource('/api/satshabad/topartist')

    function getArtist() {
        return Artist.get()
    }

    return {
        getArtist : getArtist
    }

})
