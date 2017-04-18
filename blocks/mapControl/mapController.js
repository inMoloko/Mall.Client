(function () {
    "use strict";
    var controller = function ($scope, $http, settings, $state, $rootScope) {
        $scope.options = {};
        $rootScope.$on('$stateChangeSuccess',
            function (event, toState, toParams, fromState, fromParams) {
                //Начальное состояние ничего не выбранно
                if (toState.name === 'navigation.mainMenu') {
                    $scope.options.reset();
                };

            });
    };
    controller.$inject = ['$scope', '$http', 'settings', '$state', '$rootScope'];
    angular.module('app').controller('mapController', controller);
})();