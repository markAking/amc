"use strict";

(function() {
    angular.module("songsApp").controller("SongsController",
        ["$scope", "Spotify", "$rootScope", "$uibModal", "PlaylistService", function($scope, Spotify, $rootScope, $uibModal, PlaylistService){
        
        $scope.searchType = 'track';
        $scope.playlist = false;
        $scope.songsData = false;
        $scope.listTitle = '';

        var searchType;
        $scope.submit = function() {
            searchType = $scope.searchType;
            if($scope.searchTerm !== '') {
                Spotify.search($scope.searchTerm, $scope.searchType).then(function (data) {
                    returnSongs(data);
                });
            }
        };

        $scope.add = function(item) {
            if($scope.playlist == false || $scope.playlist.length <= 10){
                $scope.selectedItem = item;
                PlaylistService.setCurrentItem(item);
                addToPlaylist();
            }
        };

        $scope.exportJson = function() {
            var json = {
                title: $scope.listTitle,
                songs: getSongs()
            };
            PlaylistService.setExportJson(json);
            showExportModal();
        }

        $rootScope.$on("updatePlaylist", function() {
            updatePlaylistFromModal();
        });

        function getSongs() {
            var songs = [];
            $scope.playlist.forEach(function(song) {
                var o = {
                    track: song.name,
                    artist: song.allArtists,
                    album: song.album.name,
                    note: song.note,
                    customImage: song.imageUrl
                }
                songs.push(o);
            })

            return songs;
        };

        function updatePlaylistFromModal() {
            if($scope.playlist == false) $scope.playlist = [];
            $scope.playlist.push(PlaylistService.getCurrentItem());
        };

        function showExportModal() {
            $rootScope.modalInstance = $uibModal.open({
                animation: true,
                ariaLabelledBy: 'modal-title-top',
                ariaDescribedBy: 'modal-body-top',
                templateUrl: 'exportModal.html',
                controller: 'ModalController',
                size: 'lg'
            });
        }

        function returnSongs(data) {
            var songs = data[searchType+'s'].items;
            songs.forEach(function(item) {
                if(searchType !== "artist") {
                    var names = Array.prototype.map.call(item.artists, function(artist) {
                        return artist.name;
                    });
                    item.allArtists = names.join(", ");
                } else {
                    item.allArtists = item.name;
                }
            });

            $scope.songsData = songs;
        }

        function addToPlaylist() {

            $rootScope.modalInstance = $uibModal.open({
                animation: true,
                ariaLabelledBy: 'modal-title-top',
                ariaDescribedBy: 'modal-body-top',
                templateUrl: 'addSong.html',
                controller: 'ModalController',
                size: 'lg'
            });
        }
    }]);

    angular.module("songsApp").service("PlaylistService", function(){
        var playlistItem;
        var playlistJson;

        const getCurrentItem = function() {
            return playlistItem;
        }

        const getExportJson = function() {
            return playlistJson;
        }

        const setCurrentItem = function(item) {
            playlistItem = item;
        }

        const setExportJson = function(json) {
            playlistJson = json;
        }

        return {
            getCurrentItem: getCurrentItem,
            setCurrentItem: setCurrentItem,
            setExportJson: setExportJson,
            getExportJson: getExportJson
        }
    })

    angular.module("songsApp").controller("ModalController", function($scope, $rootScope, PlaylistService) {

        $scope.currentItem = PlaylistService.getCurrentItem();
        $scope.playlistJson = PlaylistService.getExportJson();
        $scope.addToPlaylistHandler = function() {

            if(PlaylistService.getCurrentItem()) {

                $scope.currentItem.note = ($scope.track && $scope.track.note) ?  $scope.track.note : "";
                $scope.currentItem.imageUrl = ($scope.track && $scope.track.image) ? $scope.track.image : $scope.currentItem.album.images[2].url;
                PlaylistService.setCurrentItem($scope.currentItem);
                $rootScope.$broadcast("updatePlaylist");
            }

            $scope.closeModal();
        }

        $scope.closeModal = function() {
            $rootScope.modalInstance.close();
        }
    });
})();