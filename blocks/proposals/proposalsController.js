(function () {
    'use strict';
    var controller = function ($scope, $rootScope, $http, settings) {
        $rootScope.selectPageName = "АКЦИИ и СПЕЦПРЕДЛОЖЕНИЯ";
    };

    angular
        .module('app')
        .controller('proposalsController', controller);

    controller.$inject = ['$scope', '$rootScope', '$http', 'settings'];

})(); 