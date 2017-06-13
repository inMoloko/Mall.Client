(function () {
    "use strict";
    var controller = function ($scope, $http, settings, $rootScope, $state, $stateParams, proposalService, $linq, dbService, $timeout) {
        $scope.settings = settings;
        function getOptimalPath(array) {
            let paths = {};
            let mapObject = $rootScope.currentTerminal;//.TerminalMapObject[0].MapObject;
            //Надписи не учитывем для посторения
            array = array.filter(i => !i.ParamsAsJson || !i.ParamsAsJson.SignText);
            array.forEach(i => {
                let path = $rootScope.mapGraph.findPath(mapObject.Longitude, mapObject.Latitude, mapObject.FloorID, i.Longitude, i.Latitude, i.FloorID);
                let sum = path[path.length - 1].dksLength;
                paths[i.MapObjectID] = {
                    path: path,
                    sum: sum,
                    object: i
                };
            });
            let result = $linq.Enumerable().From(paths).OrderBy(i => i.Value.sum).FirstOrDefault();

            return result ? result.Value : null;
        }
        function filter() {
            let param = $state.params.OrganizationID;
            // if ($rootScope.organizations !== undefined) {
            //     $rootScope.currentOrganization = $rootScope.organizations.find(i => i.OrganizationID == param);
            //
            // }
            // else {
            //     let event = $rootScope.$on('floorLoad', function () {
            //         $rootScope.currentOrganization = $rootScope.organizations.find(i => i.OrganizationID == param);
            //         event();
            //     });
            // }
            // if (param)
            //     proposalService.getByOrganization(param).then(function (response) {
            //         $scope.proposals = response;
            //     });
            dbService.organizationGetById(param).then(i=>{
                $rootScope.currentOrganization = i;
            });
        };
        filter();
        let locationChangeHandler = $rootScope.$on('$locationChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
            filter();

            if ($rootScope.currentTerminal && $state.params.OrganizationID) {
                let result = getOptimalPath($rootScope.currentOrganization.MapObjects);
                dbService.getData().then(data=>{
                    $scope.code = $rootScope.currentTerminal.MTerminalID + data.Customer.Synonym + result.object.MapObjectID;
                });

            }
        });
        $scope.proposalListClosed = true;
        $scope.closeOrganization = function () {
            $timeout(function(){
                $rootScope.currentOrganization = undefined;
            });
        };
        $scope.openProposal = function () {
            if ($state.includes("**.proposalsList")) {
                $state.go('^');
                return;
            }
            if ($state.includes("**.organization")) {
                $state.go('navigation.searchResult.organization.proposalsList', {
                    CategoryID: $stateParams.CategoryID,
                    Filter: $stateParams.Filter,
                    OrganizationID: $rootScope.currentOrganization.OrganizationID
                });
                return;
            }
        };

        $scope.isVisibleSendPathControl = false;
        //$scope.selectedSendSection = 'vk';
        //$scope.botAddress = 'vk.com/bot_cartografia';

        $scope.openSendPathControl = function () {
            $scope.isVisibleSendPathControl = true;
        };

        $scope.closeSendPathControl = function () {
            $scope.isVisibleSendPathControl = false;
        };

        $scope.changeSendSection = function (section) {
            $scope.selectedSendSection = section;
            switch (section) {
                case ('vk'): {
                    $scope.botAddress = 'vk.me/kartografia_bot';
                    $scope.botUrl = 'https://vk.me/kartografia_bot';
                    break;
                }
                case ('telegram'): {
                    $scope.botAddress = 't.me/kartografia_bot';
                    $scope.botUrl = 'http://t.me/kartografia_bot';
                    break;
                }
                case ('facebook'): {
                    $scope.botAddress = 'm.me/botkartografia';
                    $scope.botUrl = 'http://m.me/botkartografia';
                    break;
                }
            }
        };
        $scope.changeSendSection('vk');
        $scope.sendMail = function (mail) {
            $scope.isBusy = true;
            let promise = $http.post(settings.webApiBaseUrl + '/BotConnection/SendMail?CustomerID=' + (settings.customerID || '') + '&MTerminalID=' + $rootScope.currentTerminal.MTerminalID, {
                Email: mail,
                OrganizationID: $stateParams.OrganizationID
            });
            promise.then(function () {
                delete $scope.mail;
                $scope.isVisibleSendPathControl = false;
            });
            promise.finally(function () {
                $scope.isBusy = false;
            });
        };
        $scope.hide = function () {
            $rootScope.currentStateName = $state.current.name;
            $rootScope.currentStateParam = $state.params;
            $rootScope.closeResultTitle = $rootScope.currentOrganization.Name;
            $state.go("navigation.closedResult", {
                CategoryID: $stateParams.CategoryID,
                Filter: $stateParams.Filter,
                OrganizationType: $stateParams.OrganizationType
            });
        };

        $scope.openTimetable = function () {
            if ($state.includes("**.organization")) {
                $state.go('.cinemaTimetable', { OrganizationID: $rootScope.currentOrganization.OrganizationID });
                return;
            }
            if ($state.includes("**.cinemaTimetable")) {
                $state.go('^', { OrganizationID: $rootScope.currentOrganization.OrganizationID });
                return;
            }
        };
        $scope.$on('$destroy', function () {
            locationChangeHandler();
        });
        $scope.getFloors = function (item) {
            if (!item)
                return;
            return item.Floors.map(i=>i.Number).join(',');
            // return item.OrganizationMapObject.map(i => {
            //     return $rootScope.floorsDic[i.MapObject.FloorID].Number;
            // }).join(',');
        };
    };
    controller.$inject = ['$scope', '$http', 'settings', '$rootScope', '$state', '$stateParams', 'proposalService', '$linq', 'dbService', '$timeout'];
    angular.module('app').controller('organizationController', controller);
})();