/**
 * Created by Nekrasov on 13.04.2017.
 */
(function () {
    'use strict';
    var service = function ($http, $q, settings, dbService, $linq) {
        this.$http = $http;
        this.$q = $q;
        this.settings = settings;
        this.dbService = dbService;
        this.$linq = $linq;
    };
    service.prototype.getBusStops = function (transportID) {
        let deferred = this.$q.defer();
        return this.$http.get(this.settings.webApiBaseUrl + `/TransportRoute/${transportID}/GetBusStops`, {cache: true}).then(i => i.data);
    };
    service.prototype.getFilter = function (filter, busStopID) {
        //return this.$http.get(this.settings.webApiBaseUrl + `/TransportRoute/GetFilter?Filter=${filter||''}&CustomerID=${this.settings.customerID}&BusStopID=${busStopID||''}`, {cache: true}).then(i => i.data);
        let self = this;
        return self.dbService.getData().then(data => {
            let result = self.$linq.Enumerable().From(data.TransportRoutes);

            if (busStopID) {
                result = result.Where(i => i.BusStops.includes(busStopID));
            }
            if(filter) {
                filter = filter.toLowerCase();
                result = result.Where(i => (i.Name && i.Name.toLowerCase() === filter) || (i.Description && i.Description.toLowerCase() === filter));
            }
            return result.ToArray();
        });

    };
    angular
        .module('app')
        .service('transportRouteService', service);

    service.$inject = ['$http', '$q', 'settings', 'dbService', '$linq'];
})();