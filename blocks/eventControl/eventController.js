(function () {
    "use strict";
    var controller = function ($scope, $http, settings, $state, $rootScope, $stateParams) {
        this.$http = $http;
        this.settings = settings;
        this.$stateParams = $stateParams;
        this.$rootScope = $rootScope;
        this.$scope = $scope;
        this.$state = $state;

        if ($rootScope.events === undefined) {
            let event = $rootScope.$on('floorLoad', function () {
                $scope.item = $rootScope.events.find(i => i.EventID == $stateParams.EventID);
                event();
            });

        }
        else {
            $scope.item = $rootScope.events.find(i => i.EventID == $stateParams.EventID);
        }

        $rootScope.selectPageName = "АФИША и НОВОСТИ";
    };
    controller.$inject = ['$scope', '$http', 'settings', '$state', '$rootScope', '$stateParams'];
    angular.module('app').controller('eventController', controller);
})();