'use strict';


// Declare app level module which depends on filters, and services
var app = angular.module('myApp', ['myApp.filters','ngRoute','ngCookies', 'myApp.directives'])

    .config(['$routeProvider', '$locationProvider',function($routeProvider, $locationProvider) {



        // use the HTML5 History API
        //$locationProvider.html5Mode(true);
    }]);
