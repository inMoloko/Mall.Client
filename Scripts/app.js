(function () {
    "use strict";
    var app = angular.module('app', ['ui.router', 'ODataResources', 'ngIdle', 'angular-linq', 'ngAnimate', 'ngScrollbars', 'monospaced.qrcode', 'indexedDB', 'vs-repeat']);
    app.config(['$indexedDBProvider', '$httpProvider', function ($indexedDBProvider, $httpProvider) {
        $indexedDBProvider.connection('localDb')
            .upgradeDatabase(1, function (event, db, tx) {
                let objStore = db.createObjectStore('statistics', {keyPath: "Date"});

            });
        //$httpProvider.defaults.withCredentials = true;
    }]);
    app.factory('httpInterceptor', [function () {
        return {
            responseError: function (response) {
                if (response !== undefined && response.status !== undefined && response.status === 401) {
                    localStorage.removeItem('auth_token');
                }
                return response;
            }
        }
    }]);
    app.config(['$httpProvider', function ($httpProvider) {
        $httpProvider.interceptors.push('httpInterceptor');
    }]);
})();
