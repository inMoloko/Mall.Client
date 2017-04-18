(function () {
    "use strict";
    var controller = function ($scope, $rootScope, $state, $http, settings, $stateParams) {
        let param = $stateParams.ProposalID;
        $http.get(settings.webApiBaseUrl + `/Proposal/${param}`).then(function (data) {
            $scope.item = data.data;
            $scope.remainder = moment($scope.item.DateEnd).diff(moment(), 'days');
        });
        $scope.day = function (days) {
            let expressions = ['день', 'дня', 'дней'];
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

        $scope.back = function () {
            $state.go('proposals.proposalsList', { OrganizationID: $rootScope.currentOrganization.OrganizationID });
        }

        $scope.hide = function () {
            $rootScope.currentStateName = $state.current.name;
            $rootScope.currentStateParam = $state.params;
            $rootScope.closeResultTitle = $rootScope.currentOrganization.Name;
            $state.go("navigation.closedResult", { CategoryID: $stateParams.CategoryID, Filter: $stateParams.Filter, OrganizationType: $stateParams.OrganizationType });
        };
    };
    controller.$inject = ['$scope', '$rootScope', '$state', '$http', 'settings', '$stateParams'];
    angular.module('app').controller('proposalController', controller);
})();