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
    service.prototype.getTransportObjects = function () {
        return this.$http.get(this.settings.webApiBaseUrl + `/MapObject/GetTransportObjects?CustomerID=${this.settings.customerID}`, {cache: true}).then(i => i.data);
    };
    angular
        .module('app')
        .service('mapObjectService', service);

    service.$inject = ['$http', '$q', 'settings'];
})();