/**
 * Created by Nekrasov on 19.04.2017.
 */
(function () {
    "use strict";
    L.FeatureGroup.ObjectLayer = L.FeatureGroup.extend({
        addSimpleMarker: function (latLng, object) {
            let marker = L.marker(latLng, {
                icon: L.divIcon({
                    className: 'circle-marker',
                    iconSize: [10, 10]
                }),
                title: object.Name,
                zIndexOffset: 10
            });
            marker.object = object;
            this.addLayer(marker);
            return marker;
        },
        addTextMarker: function (latLng, object) {
            let marker = L.marker(latLng, {
                icon: L.divIcon({
                    className: 'text-marker',
                    html: `<div></div><span>${object.Name}</span>`,
                    iconSize: null,
                    iconAnchor: [5, 5]
                }),
                title: object.Name,
                zIndexOffset: 10
            });
            marker.object = object;
            this.addLayer(marker);
            return marker;
        },
        addCategoryMarker: function (latLng, url, object) {
            let marker = L.marker(latLng, {
                icon: L.icon({
                    className: 'marker',
                    iconUrl: url,
                    iconSize: [22, 22]
                }),
                zIndexOffset: 10
            });
            marker.object = object;
            this.addLayer(marker);
            return marker;
        },
        addTerminal: function (latLng, object) {
            let marker = L.marker(latLng, {
                icon: L.icon({
                    className: 'marker',
                    iconUrl: `Content/images/youHere.png`,
                    iconSize: [40, 60],
                    iconAnchor: [20, 50]
                }),
                zIndexOffset: 400
            });
            marker.object = object;
            this.addLayer(marker);
            return marker;
        },
        findMarker: function (idName, idValue) {
            let self = this;
            for (let i in self._layers) {
                if (self._layers[i][idName] === idValue) {
                    return self._layers[i];
                }
            }
        }
    });
})();
