/**
 * Created by Nekrasov on 12.04.2017.
 */
(function () {
    'use strict';
    var service = function ($http, $q, settings) {
        this.$http = $http;
        this.$q = $q;
        this.settings = settings;
    };
    service.prototype.get = function (id) {
        let deferred = this.$q.defer();
        return this.$http.get(this.settings.webApiBaseUrl + `/BusStops`, {cache: true}).then(i => i.data);
    };
    angular
        .module('app')
        .service('busStopsService', service);

    service.$inject = ['$http', '$q', 'settings'];
})();