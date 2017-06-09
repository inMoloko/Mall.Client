/**
 * Created by Nekrasov on 12.04.2017.
 */
(function () {
    "use strict";
    const constants = {
        Terminal: 0,
        Link: 1,
        Service: 2
    };

    angular.module('app').directive("transportMap", [
        '$rootScope', 'settings', '$linq', '$state', '$stateParams', '$timeout', 'busStopsService', 'floorService', 'transportRouteService', 'dbService',
        function ($rootScope, settings, $linq, $state, $stateParams, $timeout, busStopsService, floorService, transportRouteService, dbService) {
            return {
                restrict: 'E',
                replace: true,
                scope: {
                    options: '=options'
                },
                templateUrl: 'blocks/transportMap/transportMap.html',
                link: function ($scope, element, attrs) {

                    $scope.mapFloors = {};
                    $scope.rootScope = $rootScope;
                    if (!$scope.options)
                        $scope.options = {minZoom: 17, maxZoom: 19};
                    var elm = element[0].children[0];

                    // Инициализируем карту Leaflet
                    var map = L.map(elm, {
                        rotate: true,
                        minZoom: $scope.options.minZoom,
                        maxZoom: $scope.options.maxZoom,
                        zoomControl: false,
                        attributionControl: false,
                        markerZoomAnimation: false,
                        crs: L.CRS.Simple,
                        inertia: false,
                        bounceAtZoomLimits: true,
                        fadeAnimation: false,
                        zoomSnap: 0
                    });
                    //console.log('Create map');
                    map.setView([0, 0], 1);
                    //Сброс карты
                    $scope.options.reset = function (data) {
                        $scope.setFloor($rootScope.currentTerminal);
                        setBounds(data);
                        //setView(data);
                    };

                    function getZoomRange(widthMap, heightMap, widthArea, heightArea) {
                        let a = $rootScope.currentTerminal ? $rootScope.currentTerminal.LookDirectionAngleDegrees : 0;
                        let currentWidth = (a == 0 || a == 180) ? widthMap : heightMap;
                        let currentHeight = (a == 0 || a == 180) ? heightMap : widthMap;
                        let count = 0;
                        while (currentHeight > heightArea && currentWidth > widthArea) {
                            currentHeight = currentHeight / 2;
                            currentWidth = currentWidth / 2;
                            count++;
                        }
                        ;
                        return count;
                    }

                    function setBounds() {
                        map.invalidateSize();
                        if (!$scope.currentMapFloor)
                            return;
                        let bounds = $scope.currentMapFloor.layer.getBounds();
                        map.fitBounds(bounds, {
                            paddingTopLeft: [620, 50],
                            paddingBottomRight: [50, 50],
                            reset: false,
                            animate: false
                        });
                        calculateBounds();
                    };

                    var formatThemeHandler = $rootScope.$watch("formatTheme", function (n, w) {
                        if (n == w)
                            return;
                        //Обязательно нужно пересуитать размеры
                        map.invalidateSize();
                        $timeout(function () {
                            setBounds();
                        }, 10);
                        $timeout(function () {
                            setBounds();
                        }, 40);
                        // /setBounds();
                    });
                    // Задаем обработчики событий
                    map.on("click", function (e) {
                        var floorID = $scope.currentMapFloor.FloorID;
                        var currentPoint = map.project(e.latlng);

                        let obj = $linq.Enumerable().From($scope.mapFloors[floorID].layerGroup._layers).Select(i => {
                            return {
                                Value: i.Value,
                                Distance: currentPoint.distanceTo(map.project(i.Value.getLatLng()))
                            };
                        }).Where(i => i.Distance <= 50).OrderBy(i => i.Distance).FirstOrDefault();

                        if (obj) {
                            if ($scope.selectedStops) {
                                $scope.selectedStops.forEach(i => {
                                    L.DomUtil.removeClass(i._icon, '_selected');
                                });
                                delete $scope.selectedStops;
                            }
                            L.DomUtil.addClass(obj.Value._icon, '_selected');
                            $scope.selectedStops = [obj.Value];

                            if (obj.Value.object.IsAbstract !== true)
                                $rootScope.currentPath = floorService.getPath(obj.Value.object.MapObject, $scope.terminalMapObject);
                            else
                                $rootScope.currentPath = null;

                            //$state.go(".", {BusStopID: obj.Value.object.BusStopID});
                            $rootScope.$broadcast('transport-bus-change', {filter: obj.Value.object.Name});
                            if (!$rootScope.$$phase)
                                $rootScope.$digest();
                        }
                    });

                    var tmprect;

                    function calculateBounds(offset) {
                        let full = $state.current.name == "navigation";

                        var tb = $scope.currentMapFloor.layerGroup.getBounds();

                        let s = (offset || 620) / Math.pow(2, map.getZoom());
                        //debugger;
                        //let p = s2.lng - s1.lng;
                        var maxBoundsSouthWest = new L.LatLng(tb.getSouthWest().lat, full ? tb.getSouthWest().lng : tb.getSouthWest().lng - s);
                        //var maxBoundsNorthEast = new L.LatLng(tb.getNorthEast().lat, tb.getNorthEast().lng);

                        let bounds = new L.LatLngBounds(maxBoundsSouthWest, tb.getNorthEast());
                        map.setMaxBounds(bounds);

                        return bounds.getCenter();
                    }


                    // Задаем блокирование масштабирования
                    map.on("zoomend", function () {
                        $scope.options.zoom = this.getZoom();
                        $scope.minusDisable = $scope.options.zoom <= map.getMinZoom();
                        $scope.plusDisable = $scope.options.zoom >= map.getMaxZoom();


                        calculateBounds();
                        if (!$rootScope.$$phase)
                            $scope.$parent.$digest();
                    });

                    dbService.getData().then(data => {
                        data.Floors.forEach(item => {
                            if (item.Type !== 0)
                                return;
                            let size = map.getSize();
                            let range = getZoomRange(item.Width, item.Height, size.x * 0.3, size.y);
                            //TODO Тут надо подумать пока будем брать максимальный зум
                            if (map.options.maxZoom < map.options.minZoom + range)
                                map.options.maxZoom = map.options.minZoom + range;

                            // var value = {width: item.Width, height: item.Height};
                            // var southWest = map.unproject([-value.width / 2, value.height / 2], map.getMaxZoom());
                            // var northEast = map.unproject([value.width / 2, -value.height / 2], map.getMaxZoom());

                            // if (!settings.terminalID)
                            //     item.layer = L.imageOverlay(`${settings.webApiBaseUrl}/Floor/${item.FloorID}/File`, [southWest, northEast]);
                            // else
                            //     item.layer = L.imageOverlay(`${settings.webApiBaseUrl}/Floor/${item.FloorID}/File?TerminalID=${settings.terminalID}`, [southWest, northEast]);

                            let southWest = new L.LatLng(item.SouthWest.Latitude, item.SouthWest.Longitude);
                            let northEast = new L.LatLng(item.NorthEast.Latitude, item.NorthEast.Longitude);

                            item.layer = L.imageOverlay(`${settings.resourceFolder}/Floors/${item.FloorID}.${item.FileExtension}`, new L.LatLngBounds(southWest, northEast));

                            item.layerGroup = new L.FeatureGroup.ObjectLayer();
                            item.pathGroup = L.layerGroup();
                            //item.floorMapObjects = {};
                            $scope.mapFloors[item.FloorID] = item;
                            //Остановки
                            item.BusStopMapObjects.forEach(busStop => {
                                let position = new L.LatLng(busStop.MapObject.Latitude, busStop.MapObject.Longitude);//map.unproject([busStop.MapObject.Longitude, busStop.MapObject.Latitude], map.getMaxZoom());

                                if (busStop.MapObject.Params && busStop.MapObject.Params.FontSize) {
                                    let marker = item.layerGroup.addTextMarker(position, {
                                        BusStopID: busStop.BusStopID,
                                        Name: busStop.Name,
                                        IsAbstract: busStop.IsAbstract,
                                        MapObject: busStop.MapObject
                                    });
                                }
                                else {
                                    let marker = item.layerGroup.addSimpleMarker(position, {
                                        BusStopID: busStop.BusStopID,
                                        Name: busStop.Name,
                                        IsAbstract: busStop.IsAbstract,
                                        MapObject: busStop.MapObject
                                    });
                                }
                                //busDic[busStop.BusStopID] = marker;
                            });
                            //Организации
                            item.OrganizationMapObjects.forEach(org => {
                                let position = new L.LatLng(org.MapObject.Latitude, org.MapObject.Longitude); //map.unproject([org.MapObject.Longitude, org.MapObject.Latitude], map.getMaxZoom());
                                if (org.MapObject.Params && org.MapObject.Params.SignPointRadius) {
                                    org.MapObject.ParamsAsJson = org.MapObject.Params;
                                    let markerText = L.Marker.zoomingMarker(org.MapObject);
                                    item.layerGroup.addLayer(markerText);
                                }
                                if (org.Organization.Categories.length !== 0 && org.Organization.Categories[0].ServiceCategoryType) {
                                    item.layerGroup.addCategoryMarker(position, `${settings.webApiBaseUrl}/Category/${org.Organization.Categories[0].CategoryID}/Logo`, {CategoryID: org.Organization.Categories[0].CategoryID});
                                }

                            });
                            if (item.TerminalMapObject) {
                                let position = new L.latLng(item.TerminalMapObject.Latitude, item.TerminalMapObject.Longitude); //map.unproject([item.Terminal.MapObject.Longitude, item.Terminal.MapObject.Latitude], map.getMaxZoom());
                                item.layerGroup.addTerminal(position, {MapObjectID: item.TerminalMapObject.MapObjectID});
                                $scope.terminalMapObject = item.TerminalMapObject;
                                $scope.setFloor(item.FloorID);
                            }
                        });
                    });

                    //Связь остановки и маркера
                    //let busDic = {};

                    $scope.getCount = function (floorID) {
                        return $scope.selectedOrganizations === undefined ? 0 : $linq.Enumerable().From($scope.selectedOrganizations).SelectMany(i => i.OrganizationMapObject).Count(i => i.MapObject.FloorID == floorID);
                    };

                    //Выбрали остановку
                    function selectStops(transportID) {
                        if ($scope.selectedStops) {
                            $scope.selectedStops.forEach(i => {
                                L.DomUtil.removeClass(i._icon, '_selected');
                            });
                            delete $scope.selectedStops;
                        }
                        transportRouteService.getBusStops(transportID).then(i => {
                            $scope.selectedStops = [];
                            if (i.length === 0) {
                                $rootScope.currentPath = null;
                                return;
                            }
                            let markers = $linq.Enumerable().From($scope.mapFloors).SelectMany(i => i.Value.layerGroup._layers).Select(i => i.Value);
                            i.forEach(j => {

                                let marker = markers.Where(i => i.object.BusStopID === j.BusStopID).FirstOrDefault();
                                if (marker) {
                                    L.DomUtil.addClass(marker._icon, '_selected');
                                    $scope.selectedStops.push(marker);
                                }
                            });
                            let path = floorService.getOptimalPath(i.map(i => i.MapObject), $scope.terminalMapObject);
                            $rootScope.currentPath = path.path;
                        });
                    };

                    //Выбран маршрут
                    var currentPathHandler = $rootScope.$watch('currentPath', function (n, o) {

                        //Очистка слоев с путями
                        for (let f in $scope.mapFloors) {
                            if ($scope.mapFloors[f].pathGroup)
                                $scope.mapFloors[f].pathGroup.clearLayers();
                        }

                        if ($rootScope.currentPath !== undefined && $rootScope.currentPath !== null) {

                            let maxZoom = map.getMaxZoom();
                            //Нужно выделить из несколько линий для каждого этажа
                            let currentFloor;
                            let currentLines = new Map();
                            let currentLine;
                            $rootScope.currentPath.forEach(path => {
                                if (currentFloor !== path.layer.layerID) {
                                    currentFloor = path.layer.layerID;
                                    if (currentLines.has(currentFloor))
                                        currentLine = currentLines.get(currentFloor);
                                    else {
                                        currentLine = [];
                                        currentLines.set(currentFloor, currentLine);
                                    }
                                }
                                currentLine.push(new L.latLng(path.Y, path.X)/*map.unproject([path.x, path.y], maxZoom)*/);

                            });

                            //Теперь строим сами линии
                            currentLines.forEach((value, key, m) => {

                                let line = L.polyline(value, {color: 'red', className: 'path'});

                                let myMovingMarker = L.Marker.movingMarker(value, settings.manVelocity, {
                                    loop: true,
                                    autostart: true,
                                    zIndexOffset: 700
                                });
                                let floor = $scope.mapFloors[key];
                                if (!floor.pathGroup)
                                    return;
                                floor.pathGroup.addLayer(line);
                                floor.pathGroup.addLayer(myMovingMarker);
                            });
                        }

                    });
                    let changeStatehandler = $rootScope.$on('$stateChangeSuccess',
                        function (event, toState, toParams, fromState, fromParams) {
                            if (toState.resetMap)
                                $scope.options.reset(toState);
                        });
                    $rootScope.$on('transport-change', function (ev, args) {
                        if (args.TransportRouteID) {
                            selectStops(args.TransportRouteID);
                        }
                    });

                    let resetHandler = $rootScope.$on('resetMap', function () {
                        //map.fitBounds($scope.currentMapFloor.bound);
                        if ($state.current.resetMap)
                            $scope.options.reset($state.current);
                    });
                    $scope.$on("$destroy", function () {
                        //console.log('destroy map');
                        if ($scope.selectedOrganizations !== undefined) {
                            delete $scope.selectedOrganizations;
                        }
                        if ($scope.currentMapFloor !== undefined) {
                            if ($scope.currentMapFloor.layer)
                                map.removeLayer($scope.currentMapFloor.layer);
                            if ($scope.currentMapFloor.layerGroup)
                                map.removeLayer($scope.currentMapFloor.layerGroup);
                            if ($scope.currentMapFloor.pathGroup)
                                map.removeLayer($scope.currentMapFloor.pathGroup);
                            delete $scope.mapFloors;
                            delete $scope.mapOrganizations;
                            delete $scope.currentMapFloor.layer;
                            delete $scope.currentMapFloor.layerGroup;
                            delete $scope.currentMapFloor.pathGroup;
                            delete $scope.currentMapFloor;
                        }
                        delete $scope.selectedStops;
                        changeStatehandler();
                        resetHandler();
                        formatThemeHandler();
                        currentPathHandler();
                        map.removeEventListener();
                        map.remove();
                        map = null;
                        //busDic = null;
                    });
                    $scope.zoomIn = function () {
                        map.zoomIn();
                    };
                    $scope.zoomOut = function () {
                        map.zoomOut();
                    };
                    $scope.setFloor = function (floorID) {
                        if (floorID === undefined || ($scope.currentMapFloor !== undefined && floorID === $scope.currentMapFloor.FloorID))
                            return;
                        var floor = $scope.mapFloors[floorID];
                        if (floor !== undefined) {
                            if ($scope.currentMapFloor !== undefined) {
                                map.removeLayer($scope.currentMapFloor.layer);
                                map.removeLayer($scope.currentMapFloor.pathGroup);
                                map.removeLayer($scope.currentMapFloor.layerGroup);

                            }
                            floor.layer.addTo(map);
                            floor.pathGroup.addTo(map);
                            floor.layerGroup.addTo(map);
                        }
                        $scope.currentMapFloor = floor;
                        setBounds();
                    };
                }
            };
        }
    ]);
})();