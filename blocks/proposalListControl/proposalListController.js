(function () {
    "use strict";
    var controller = function ($scope, $rootScope, $http, settings, $stateParams, $state, proposalService) {
        //$scope.items = $rootScope.proposals;

        proposalService.getFilter().then(i=>{
            $scope.items = i;
        });

        if ($scope.items !== undefined && $scope.items.length !== 0) {
            if ($state.current.name === 'proposals.searchResult')
                $state.go("proposals.searchResult.proposal", { ProposalID: $scope.items[0].ProposalID });
            $scope.selectedProposalID = $scope.items[0].ProposalID;            
        }
        

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

        // imagesLoaded('.wrapper', { background: true }, function () {
        //     setTimeout($rootScope.initMasonry, 250);
        // });

        $scope.select = function (proposalID) {
            $scope.selectedProposalID = proposalID;
            setTimeout($scope.initMasonry, 250);
        }
        $rootScope.selectPageName = "АКЦИИ и СКИДКИ";
        
    };
    controller.$inject = ['$scope', '$rootScope', '$http', 'settings', '$stateParams', '$state', 'proposalService'];
    angular.module('app').controller('proposalListController', controller);
})();