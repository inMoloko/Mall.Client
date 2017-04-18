(function () {
    "use strict";
    var controller = function ($scope, $http, settings, $state, $timeout, $rootScope) {
        $scope.changeType = function (type) {
            // if ($state.current.name !== "organization")
            //     $state.go('organization');
            // $timeout(function () {
            //     $rootScope.$broadcast("filterChange", { type });
            // }, 100);
            var tmp = $rootScope.organizations;
            if (type !== undefined) {
                var split = angular.isString(type) ? type.split(',').map(i => parseInt(i)) : [type];
                tmp = tmp.filter(item => split.includes(item.OrganizationType));
                // tmp = tmp.filter(item =>item.OrganizationType === 5 );
            }
            $rootScope.currentOrganizations = tmp;
        };
    };
    controller.$inject = ['$scope', '$http', 'settings', '$state', '$timeout', '$rootScope'];
    angular.module('app').controller('mainMenuController', controller);
})();