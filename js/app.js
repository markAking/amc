"use strict";

var app = angular.module('songsApp', ['ngRoute', 'spotify', 'ui.bootstrap']);
app.config(function($routeProvider) {
	$routeProvider
        .when('/', {
            templateUrl: 'views/songsView.html',
            controller: 'SongsController'
        })
        .otherwise({
            template: '<h1>Not Found</h1>'
        });

});

