angular.module('app').
controller("TrackCtrl",["$scope", "Tracks", "ngProgress", "RandomTopArtist",
        function($scope, Tracks, ngProgress, RandomTopArtist) {

            $scope.getTracks = function () {
                datestring = $scope.months[$scope.monthIndex] +  " 15th " + $scope.years[$scope.yearIndex].toString();
                time = moment(datestring, "MMM DD YYYY").utc().unix()
                ngProgress.start();

                Tracks.getTracks($scope.username, time).then(function (tracks) {
                    $scope.firstTime = false;
                    ngProgress.complete()
                    $scope.artists = groupTracks(tracks.monthlytrackchart.track)
                    console.log($scope.artists);

                    if($scope.showError()){
                        $scope.suggestion = RandomTopArtist.getArtist()
                    }

                }).catch(function () {
                    $scope.firstTime = false;
                    $scope.artists = [];

                    if($scope.showError()){
                        $scope.suggestion = RandomTopArtist.getArtist()
                    }

                    ngProgress.complete()
                })
            };

            $scope.timeInSeconds = moment().subtract('years', 1).utc().unix();
            $scope.months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
            $scope.years = [2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013];

            // This can't be the best way to do this...
            $scope.subMonth = function () {
                $scope.monthIndex = mod($scope.monthIndex - 1, $scope.months.length);
            }
            $scope.incMonth = function () {
                $scope.monthIndex = mod($scope.monthIndex + 1, $scope.months.length);
            }
            $scope.subYear = function () {
                $scope.yearIndex = mod($scope.yearIndex - 1, $scope.years.length);
            }
            $scope.incYear = function () {
                $scope.yearIndex = mod($scope.yearIndex + 1, $scope.years.length);
            }

            $scope.showError = function () {
                return (($scope.artists.length == 0) && !$scope.firstTime)
            };

            $scope.changeSelected = function (index) {
                $scope.selected = index;
            };

            $scope.imageSource = function (artist) {

                if (artist[1][0].image === undefined){
                    return artist[1][0].artist.image[artist[1][0].artist.image.length -1].text;
                }

                if (artist[1][0].artist.image === undefined){
                    return artist[1][0].image[artist[1][0].image.length-1].text;
                }

            };

            $scope.artists = []
            $scope.monthIndex = 0;
            $scope.yearIndex = 11;
            $scope.firstTime = true;
            $scope.selected = -1;

            function mod(a, b) {
                return (((a % b) + b) % b)
            };

            function groupTracks(tracks) {
                var artistGroups = _.groupBy(tracks, function (track, i) {
                    return track.artist.text;
                })

                return _.sortBy(_.pairs(artistGroups), function (item) {
                    return item[1].length;
                }).reverse()
            }


        }]);

