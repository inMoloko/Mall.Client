(function () {
    "use strict";
    var controller = function ($scope, $http, settings, $rootScope, $state, $stateParams, $linq, dbService) {

        // if ($rootScope.organizations === undefined) {
        //     let event = $rootScope.$on('floorLoad', function () {
        //         filter();
        //         event();
        //     });
        //
        // }
        // else {
        //     filter();
        // }

        filter();

        function filter() {
            // console.time('search');
            dbService.organizationGetFilter($stateParams.Filter, $stateParams.CategoryID).then(result => {
                $rootScope.otherCurrentOrganizations = result.otherCurrentOrganizations;
                $rootScope.currentOrganizations = result.currentOrganizations;
                $rootScope.searchText = $stateParams.Filter;
                // console.timeEnd('search');
            });
        };
        $scope.settings = settings;

        $scope.home = function () {
            $state.go('navigation.mainMenu');
        };
        $scope.select = function (item) {
            $state.go('navigation.searchResult.organization', {
                OrganizationID: item.OrganizationID,
                Filter: $stateParams.Filter,
                CategoryID: $stateParams.CategoryID
            }, {inherit: true});
        };

        $scope.hide = function () {
            $rootScope.currentStateName = $state.current.name;
            $rootScope.currentStateParam = $state.params;
            $rootScope.closeResultTitle = 'Найдено ' + $rootScope.currentOrganizations.length;
            $state.go("navigation.closedResult", {
                CategoryID: $stateParams.CategoryID,
                Filter: $stateParams.Filter,
                OrganizationType: $stateParams.OrganizationType
            });
        };
        let stateChangeHandler = $rootScope.$on('$stateChangeSuccess',
            function (event, toState, toParams, fromState, fromParams) {
                if (toState.name === 'navigation.searchResult' && fromState.name === 'navigation.searchResult.organization') {
                    $rootScope.currentOrganization = undefined;
                    filter();
                }
                ;
            });
        $scope.$on("$destroy", function () {
            stateChangeHandler();
            locationChangeHandler();
        });
        let locationChangeHandler = $scope.$on('$locationChangeSuccess', function () {
            filter();
        });
        $scope.getFloors = function (item) {
            if (!item)
                return;
            return $linq.Enumerable()
                .From(item.Floors).Select(i => i.Number).Distinct().ToArray().join(',');
            // return $linq.Enumerable()
            //     .From(item.OrganizationMapObject)
            //     .Where(i => $rootScope.floorsDic[i.MapObject.FloorID])
            //     .Select(i => $rootScope.floorsDic[i.MapObject.FloorID].Number).Distinct().ToArray().join(',');
            //
            // return item.OrganizationMapObject.filter(i => $rootScope.floorsDic[i.MapObject.FloorID]).map(i => {
            //     return $rootScope.floorsDic[i.MapObject.FloorID].Number;
            // }).join(',');
        };
    };
    controller.$inject = ['$scope', '$http', 'settings', '$rootScope', '$state', '$stateParams', '$linq', 'dbService'];
    angular.module('app').controller('organizationsListController', controller);
})();