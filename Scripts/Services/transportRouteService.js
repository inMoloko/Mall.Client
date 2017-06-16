/**
 * Created by Nekrasov on 13.04.2017.
 */
(function () {
    'use strict';
    class TransportRouteService {
        constructor(dbService, $linq) {
            this.dbService = dbService;
            this.$linq = $linq;
        }

        getBusStops(transportID) {
            let self = this;
            return self.dbService.getData().then(data => {
                return self.$linq.Enumerable()
                    .From(data.TransportRoutes)
                    .Where(i => i.TransportRouteID == transportID)
                    .SelectMany(i => i.BusStops)
                    .Select(i => data.BusStops[i])
                    .ToArray();

            });
        };

        getFilter(filter, busStopID) {
            let self = this;
            return self.dbService.getData().then(data => {
                let result = self.$linq.Enumerable().From(data.TransportRoutes);

                if (busStopID) {
                    result = result.Where(i => i.BusStops.includes(busStopID));
                }
                if (filter) {
                    filter = filter.toLowerCase();
                    result = result
                        .Where(i => (i.Name && i.Name.toLowerCase().includes(filter))
                                || (i.Description && i.Description.toLowerCase().includes(filter))
                                || self.$linq.Enumerable().From(i.BusStops).Select(i => data.BusStops[i].Name.toLowerCase()).Any(i=>i.includes(filter))
                        );
                }
                return result.ToArray();
            });

        };
    }
    // var service = function ($http, $q, settings, dbService, $linq) {
    //     this.$http = $http;
    //     this.$q = $q;
    //     this.settings = settings;
    //     this.dbService = dbService;
    //     this.$linq = $linq;
    // };
    // service.prototype.getBusStops = function (transportID) {
    //     let self = this;
    //     // let deferred = this.$q.defer();
    //     // return this.$http.get(this.settings.webApiBaseUrl + `/TransportRoute/${transportID}/GetBusStops`, {cache: true}).then(i => i.data);
    //     return self.dbService.getData().then(data => {
    //         return self.$linq.Enumerable()
    //             .From(data.TransportRoutes)
    //             .Where(i => i.TransportRouteID == transportID)
    //             .SelectMany(i => i.BusStops)
    //             .Select(i => data.BusStops[i])
    //             .ToArray();
    //
    //     });
    // };
    // service.prototype.getFilter = function (filter, busStopID) {
    //     //return this.$http.get(this.settings.webApiBaseUrl + `/TransportRoute/GetFilter?Filter=${filter||''}&CustomerID=${this.settings.customerID}&BusStopID=${busStopID||''}`, {cache: true}).then(i => i.data);
    //     let self = this;
    //     return self.dbService.getData().then(data => {
    //         let result = self.$linq.Enumerable().From(data.TransportRoutes);
    //
    //         if (busStopID) {
    //             result = result.Where(i => i.BusStops.includes(busStopID));
    //         }
    //         if (filter) {
    //             filter = filter.toLowerCase();
    //             result = result.Where(i => (i.Name && i.Name.toLowerCase().includes(filter)) || (i.Description && i.Description.toLowerCase().includes(filter)));
    //         }
    //         return result.ToArray();
    //     });
    //
    // };
    angular
        .module('app')
        .service('transportRouteService', TransportRouteService);

    TransportRouteService.$inject = ['dbService', '$linq'];
})();