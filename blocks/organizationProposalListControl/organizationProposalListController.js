(function () {
    "use strict";
    var controller = function ($scope, $rootScope, $state, $http, settings, $stateParams) {
        let param = $stateParams.OrganizationID;
        let dt = new Date().toISOString();
        let filter = `OrganizationID eq ${param} and DateEnd ge DateTime'${dt}' and DateBegin le DateTime'${dt}'`;
        $http.get(settings.webApiBaseUrl + `/Proposal?$select=ProposalID,DateBegin,DateEnd,Name,Summary&$filter=${filter}`).then(function (data) {
            $scope.items = data.data;
        });

        $scope.hide = function () {
            $rootScope.currentStateName = $state.current.name;
            $rootScope.currentStateParam = $state.params;
            $rootScope.closeResultTitle = $rootScope.currentOrganization.Name;
            $state.go("navigation.closedResult", { CategoryID: $stateParams.CategoryID, Filter: $stateParams.Filter, OrganizationType: $stateParams.OrganizationType });
        };

        $scope.back = function () {
            $state.go("navigation.searchResult.organization", { OrganizationID: $rootScope.currentOrganization.OrganizationID });
        };

        $scope.day = function (days) {
            let expressions = ['день','дня','дней'];
            let result;
            let count = days % 100;
            if (count >= 5 && count <= 20) {
                result = expressions[2];
            } else {
                count = count % 10;
                if (count == 1) {
                    result = expressions[0];
                } else if (count >= 2 && count <= 4) {
                    result = expressions[1];
                } else {
                    result = expressions[2];
                }
            }
            return result;
        };

        imagesLoaded('.wrapper', { background: true }, function () {
            setTimeout($rootScope.initMasonry, 250);
        });
    };
    controller.$inject = ['$scope', '$rootScope', '$state', '$http', 'settings', '$stateParams'];
    angular.module('app').controller('organizationProposalListController', controller);
})();