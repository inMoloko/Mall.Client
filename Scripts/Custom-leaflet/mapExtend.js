/**
 * Created by Nekrasov on 6/9/2017.
 */
(function () {
    L.Map = L.Map.extend({
        convertPosition: function (mapObject) {
            let self = this;
            if (true) {
                return new L.LatLng(mapObject.Latitude, mapObject.Longitude);
            }
            else {
                return self.unproject([mapObject.MapObject.Longitude, mapObject.MapObject.Latitude], self.getMaxZoom());
            }
        },
        offsetLng(latlng, dist) {
            let R = 6371000; //earth’s radius in metres
            let brng = Math.PI / 2;
            let d = dist; //Distance in m

            let lat1 = latlng.lat * Math.PI / 180;
            let lng1 = latlng.lng * Math.PI / 180;
            let lat2 = Math.asin(Math.sin(lat1) * Math.cos(d / R) + Math.cos(lat1) * Math.sin(d / R) * Math.cos(brng));
            let lng2 = (lng1 + Math.atan2(Math.sin(brng) * Math.sin(d / R) * Math.cos(lat1), Math.cos(d / R) - Math.sin(lat1) * Math.sin(lat2))) * 180 / Math.PI;

            return L.latLng(latlng.lat, lng2);
        }
    });
})();