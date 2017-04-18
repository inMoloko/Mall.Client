(function () {
    "use strict";
    var controller = function ($scope, $http, settings, $state, $rootScope, $timeout) {
        $scope.change = function () {
            $state.go('navigation.mainMenu', {});
        };
        $scope.changeType = function (type) {
            //if ($state.current.name !== "navigation.searchResult")
            //    $state.go('navigation.searchResult');
            $timeout(function() {
                $rootScope.$broadcast("filterChange", { type });
            }, 100);

        };
    };
    controller.$inject = ['$scope', '$http', 'settings', '$state', '$rootScope', '$timeout'];
    angular.module('app').controller('mainMenuController', controller);
})();