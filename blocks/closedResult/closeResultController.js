(function () {
    "use strict";
    var controller = function ($scope, $http, settings, $state, $rootScope, $stateParams) {
        $scope.comeBack = function () {
            $state.go($rootScope.currentStateName, $rootScope.currentStateParam);
        };        
    };
    controller.$inject = ['$scope', '$http', 'settings', '$state', '$rootScope', '$stateParams'];
    angular.module('app').controller('closeResultController', controller);
})();