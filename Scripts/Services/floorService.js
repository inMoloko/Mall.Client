/**
 * Created by Nekrasov on 12.04.2017.
 */
(function () {
    'use strict';
    var service = function ($http, $q, settings, $linq) {
        this.$http = $http;
        this.$q = $q;
        this.settings = settings;
        this.$linq = $linq;
    };
    service.prototype.getWithSize = function (Type = null) {
        let self = this;
        return this.$http.get(this.settings.webApiBaseUrl + `/Floor/GetWithPaths?Type=${Type}`, {cache: true}).then(i => {
            let data = i.data;

            self.initGraph(data.Floors, data.Terminal);
            return data;
        });
    };
    service.prototype.initGraph = function (floors, terminal) {
        let self = this;
        if (self.graph)
            return;
        self.graph = new Graph();
        floors.forEach(i => {
            if (!self.graph.hasLayer(i.FloorID)) {
                let layer = self.graph.addLayer(i.FloorID);
                i.Paths.forEach(j => {
                    layer.addSegment(j[0].X, j[0].Y, j[1].X, j[1].Y);
                });
            }
        });
        self.graph.getLayer(terminal.FloorID).addVertexWithShortestSegment(terminal.Longitude, terminal.Latitude);
    };
    /**
     *
     * @param array {Array}
     * @param terminalMapObject {MapObject}
     * @returns {null}
     */
    service.prototype.getOptimalPath = function (array, terminalMapObject) {
        let self = this;
        if (!self.graph)
            return null;
        let paths = {};
        array.forEach(i => {
            let path = self.graph.findPath(terminalMapObject.Longitude, terminalMapObject.Latitude, terminalMapObject.FloorID, i.Longitude, i.Latitude, i.FloorID);
            let sum = path[path.length - 1].dksLength;
            paths[i.MapObjectID] = {
                path: path,
                sum: sum,
                object: i
            };
        });
        let result = self.$linq.Enumerable().From(paths).OrderBy(i => i.Value.sum).FirstOrDefault();

        return result ? result.Value : null;
    };
    service.prototype.getPath = function (mapObject, terminalMapObject) {
        let self = this;
        if (!self.graph)
            return null;
        return self.graph.findPath(terminalMapObject.Longitude, terminalMapObject.Latitude, terminalMapObject.FloorID, mapObject.Longitude, mapObject.Latitude, mapObject.FloorID);
    };
    service.prototype.getFullMap = function () {
        let self = this;
        return this.$http.get(this.settings.webApiBaseUrl + `/Floor/GetFullMap?CustomerID=${this.settings.customerID || ''}`, {cache: true}).then(i => {
            let data = i.data;
            let terminal = data.find(i => i.Terminal);
            if (terminal) {
                terminal = terminal.Terminal;
                self.initGraph(data, terminal);
            }else
                console.error('Нет терминала на этаже, граф не инициализирован');

            return data;
        });
    };
    angular
        .module('app')
        .service('floorService', service);

    service.$inject = ['$http', '$q', 'settings', '$linq'];
})();