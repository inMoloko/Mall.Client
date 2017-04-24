/**
 * Created by Nekrasov on 13.04.2017.
 */
(function () {
    'use strict';
    var service = function ($http, $q, settings) {
        this.$http = $http;
        this.$q = $q;
        this.settings = settings;
    };
    service.prototype.getBusStops = function (transportID) {
        let deferred = this.$q.defer();
        return this.$http.get(this.settings.webApiBaseUrl + `/TransportRoute/${transportID}/GetBusStops`, {cache: true}).then(i => i.data);
    };
    service.prototype.getFilter = function (filter, busStopID) {
        return this.$http.get(this.settings.webApiBaseUrl + `/TransportRoute/GetFilter?Filter=${filter||''}&CustomerID=${this.settings.customerID}&BusStopID=${busStopID||''}`, {cache: true}).then(i => i.data);
    };
    angular
        .module('app')
        .service('transportRouteService', service);

    service.$inject = ['$http', '$q', 'settings'];
})();