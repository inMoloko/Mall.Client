(function () {
    "use strict";
    var controller = function ($scope, $http, settings, $rootScope, $state, mainMenuService, customerService) {

        mainMenuService.get().then(i => {
            $scope.menuItems = i
        });
        customerService.get().then(i=>{
            $scope.customer = i;
        });
        customerService.getSchedule().then(i=>{
           $scope.schedule = i;
        });

        $scope.sizeMenuItem = function () {
            if ($('#sideMenu').height() > 600)
                return "menuItemFull";
            else if ($('#sideMenu').height() > 420)
                return "menuItemSmall";
            else
                return "menuItemVerrySmall";
        };

        $scope.visibleMenuItemName = function () {
            if ($('#sideMenu').height() < 420)
                return true;
        };

        $scope.selectMenuItem = function (menuItem) {
            switch (menuItem) {
                case ('proposal'): {
                    if ($rootScope.orientation == 'vertical')
                        $state.go('proposals.proposalsList', {});
                    else
                        $state.go('proposals.searchResult', {});
                    break;
                }
                    ;
                case ('events'): {
                    if ($rootScope.orientation == 'vertical')
                        $state.go('events.eventsList', {});
                    else
                        $state.go('events.searchResult', {});
                    break;
                }
                    ;
            }
        }

        $scope.listAnchorLength = "Empty";

        $rootScope.$watch('anchorOrganizations', function () {
            if ($rootScope.anchorOrganizations && $rootScope.anchorOrganizations.length > 0)
                $scope.listAnchorLength = "NotEmpty";
        });

        $scope.goScheduleControl = function () {
            if ($scope.listAnchorLength == "NotEmpty")
                $state.go('navigation.shedule', {});
        };
        $scope.selectItem = function (obj) {
            if (obj.type == 'category')
                $state.go('navigation.searchResult', {CategoryID: obj.CategoryID});
            if (obj.type == 'organization')
                $state.go('navigation.searchResult.organization', {OrganizationID: obj.OrganizationID});
        };

    };
    controller.$inject = ['$scope', '$http', 'settings', '$rootScope', '$state', 'mainMenuService', 'customerService'];
    angular.module('app').controller('sideMenuController', controller);
})();