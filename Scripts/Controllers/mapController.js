(function () {
    "use strict";
    var controller = function ($scope, $http, settings, $state, $rootScope) {
    //     function load(event, filter) {
    //         $scope.mapObject = {
    //             organizations: $rootScope.organizations,
    //             floors: $rootScope.floors
    //         };
    //     };
    //     var floorLoadHandler = $rootScope.$on("floorLoad", load);


    //     $scope.$on("$destroy", function () {
    //         floorLoadHandler();
    //     });
     };
    controller.$inject = ['$scope', '$http', 'settings', '$state', '$rootScope'];
    angular.module('app').controller('mapController', controller);
})();