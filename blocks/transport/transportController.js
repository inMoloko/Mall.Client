(function () {
    'use strict';
    var controller = function ($scope, $rootScope, $http, settings, $state, transportRouteService) {
        let self = this;
        self.transportRouteService = transportRouteService;
        // $http.get(settings.webApiBaseUrl + '/TransportRoute?$expand=TransportType&CustomerID=' + settings.customerID).then(function (data) {
        //     $scope.items = data.data;
        // });
        self.$scope = $scope;

        self.pending = true;
        transportRouteService.getFilter().then(i => {
            $scope.items = i;
            self.pending = false;
        }, i => {
            self.pending = false;
        });

        $('#searchInput').bind('writeKeyboard', function (event, a) {
            self.filter = $('#searchInput')[0].value;
            self.search();
            $scope.$apply();
        });

        $scope.go = function (item) {
            $rootScope.$broadcast('transport-change', {TransportRouteID: item.TransportRouteID})
            self.currentItem = item;
        };

        $rootScope.$on('transport-bus-change', function (event, args) {
            self.filter = args.filter;
            self.search();
        });
    };
    controller.prototype.search = function () {
        let self = this;
        self.pending = true;
        self.transportRouteService.getFilter(self.filter, self.busStopID).then(i => {
            self.$scope.items = i;
            self.pending = false;
        }, i => {
            self.pending = false;
        });

    };
    controller.prototype.clear = function () {
        let self = this;
        self.filter = '';
        self.search();
    };
    angular
        .module('app')
        .controller('transportController', controller);

    controller.$inject = ['$scope', '$rootScope', '$http', 'settings', '$state', 'transportRouteService'];

})();