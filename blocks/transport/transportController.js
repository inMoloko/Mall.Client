(function () {
    'use strict';
    var controller = function ($scope, $rootScope, $http, settings, $state) {

        $http.get(settings.webApiBaseUrl + '/TransportRoute?$expand=TransportType&CustomerID=' + settings.customerID).then(function (data) {
            $scope.items = data.data;
        });
        $rootScope.selectPageName = "КАК ДОБРАТЬСЯ";

        $scope.go = function (item) {
            $rootScope.$broadcast('transport-change',{TransportRouteID: item.TransportRouteID})
        };
    };

    angular
        .module('app')
        .controller('transportController', controller);

    controller.$inject = ['$scope', '$rootScope', '$http', 'settings','$state'];

})();