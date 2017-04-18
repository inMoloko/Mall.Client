(function () {
    L.Marker.prototype.__setPos = L.Marker.prototype._setPos;
    L.Marker.prototype._setPos = function () {
        L.Marker.prototype.__setPos.apply(this, arguments);
        this._zIndex = this.options.zIndexOffset;
        this._resetZIndex();
    };
    angular.module('app').directive("__molokoMap", [
        '$rootScope', '$http', '$q', 'settings', '$linq', '$state', '$timeout', function ($rootScope, $http, $q, settings, $linq, $state, $timeout) {
            return {
                restrict: 'E',
                replace: true,
                scope: {
                    options: '=options'
                },
                templateUrl: './Views/molokoMap.html',
                link: function ($scope, element, attrs) {
                    $scope.rootScope = $rootScope;
                    if (!$scope.options)
                        $scope.options = {};
                    if (!$scope.options.minZoom)
                        $scope.options.minZoom = 17;
                    if (!$scope.options.maxZoom)
                        $scope.options.maxZoom = 20;
                    if (!$scope.options.orginalAngel)
                        $scope.options.orginalAngel = false;
                    var elm = element[0].children[0];


                    $scope.southWest = L.latLng(-0.002, -0.002);
                    $scope.northEast = L.latLng(0.002, 0.005);
                    mybounds = L.latLngBounds(L.latLng(-0.002, -0.002), L.latLng(0.002, 0.005));

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
                        //maxBounds: mybounds,
                        zoomSnap: 0
                    });
                    //console.log('Create map');
                    //map.fitWorld();
                    //map.panBy([-200,0]);
                    map.setView([0, 0], $scope.options.minZoom + 1);
                    //Сброс карты
                    $scope.options.reset = function (data) {
                        $scope.options.orginalAngel = false;

                        $scope.setFloor($rootScope.currentTerminal.Organization.Floor.FloorID);
                        setBounds(data);
                        //setView(data);
                    };
                    function setView(data) {

                        let rad = $rootScope.currentTerminal ? $rootScope.currentTerminal.LookDirectionAngleDegrees : 0;
                        rad = $scope.options.orginalAngel == true ? 0 : rad;
                        //let angle = Math.round(($scope.options.orginalAngel == true ? 0 : (rad * 180 / 3.14) * 100)) / 100;
                        //navigation - тут нет сайдбара нужно по центру
                        let divider = map.getZoom() == $scope.options.minZoom + 1 ? 3 : 6;
                        if ($rootScope.formatTheme == "formatTheme_horizontalSmall")
                            divider = 2;
                        let width = data && data.fullScreen ? 0 : (map.getBounds()._northEast.lat - map.getBounds()._southWest.lat) / divider;
                        let zoom = $rootScope.formatTheme == "formatTheme_horizontalSmall" ? $scope.options.minZoom : $scope.options.minZoom + 1;

                        map.setView([0, 0.001], map.getZoom());
                    };
                    function getZoomRange(widthMap, heightMap, widthArea, heightArea) {
                        let a= $rootScope.currentTerminal ? $rootScope.currentTerminal.LookDirectionAngleDegrees : 0;
                        let currentWidth = (a==0||a==180) ? widthMap:heightMap;
                        let currentHeight =(a==0||a==180) ? heightMap:widthMap;
                        let count = 0;
                        while (currentHeight > heightArea && currentWidth > widthArea) {
                            currentHeight = currentHeight / 2;
                            currentWidth = currentWidth / 2;
                            count++;
                        };
                        return count;
                    }
                    function setBounds() {
                        map.invalidateSize();
                        let bounds = $scope.currentMapFloor.layerGroup.getBounds();
                        let rad = $rootScope.currentTerminal ? $rootScope.currentTerminal.LookDirectionAngleDegrees : 0;
                        rad = $scope.options.orginalAngel == true ? 0 : rad;

                        let size = map.getSize();
                        let width = $state.current.name == "navigation" ? 50 : size.x * 0.3;
                        let full = $state.current.name == "navigation";
                        let lat = 0.003;
                        let lng = 0.005;
                        switch (rad) {
                            case 0:
                                //map.setMaxBounds(L.latLngBounds(L.latLng(-lat, -lng * 3), L.latLng(lat, full ? lng * 3 : lng)));
                                map.setMaxBounds(L.latLngBounds(L.latLng(-lat, -lng), L.latLng(lat, full ? lng :lng * 0.33)));
                                //map.setMaxBounds(bounds);
                                map.fitBounds(bounds, { paddingTopLeft: [width, 50], paddingBottomRight: [50, 50] });
                                break;
                            case 180:
                                map.setMaxBounds(L.latLngBounds(L.latLng(-lat, full ? -lng * 3 : -lng), L.latLng(lat, lng * 3)));
                                map.fitBounds(bounds, { paddingTopLeft: [-width, 50], paddingBottomRight: [50, 50] });

                                break;
                            case 90:
                                map.setMaxBounds(L.latLngBounds(L.latLng(full ? -lat * 3 : -lat, -lng), L.latLng(full ? lat * 3 : lat, lng)));
                                map.fitBounds(bounds, { paddingTopLeft: [50, 50], paddingBottomRight: [width, 50] });
                                //{_northEast:bounds._southWest,_southWest:bounds._northEast}
                                break;
                            case 270:
                                map.setMaxBounds(L.latLngBounds(L.latLng(full ? lat *3: lat, -lng), L.latLng(lat, lng)));
                                map.fitBounds(bounds, { paddingTopLeft: [50, 50], paddingBottomRight: [-width, 50] });
                                break;
                        }
                        let northEast = map.unproject([0, size.y * 4], map.getZoom());
                        let southWest = map.unproject([size.x * 3, 0], map.getZoom());

                        let mapBounds = $scope.currentMapFloor.layer.getBounds();
                        //northEast = L.latLng(mapBounds._northEast.lat*2, mapBounds._northEast.lng*2);
                        //southWest = L.latLng(mapBounds._southWest.lat*2, mapBounds._southWest.lng*4);
                        //map.setMaxBounds();
                        //map.setMaxBounds(mapBounds);
                        //L.rectangle(new L.LatLngBounds(southWest, northEast), { color: "#f77800", weight: 1 }).addTo(map);
                        //L.rectangle(mapBounds, { color: "#f77800", weight: 1 }).addTo(map);
                        //map.setMaxBounds(new L.LatLngBounds(southWest, northEast));

                    };
                    map.on("moveend", function (e) {
                        //setBounds();
                    });
                    var formatThemeHandler = $rootScope.$watch("formatTheme", function (n, w) {
                        if (n == w)
                            return;
                        $timeout(function () { setBounds(); }, 10);
                        $timeout(function () { setBounds(); }, 40);
                        // /setBounds();
                    });
                    // Задаем обработчики событий
                    map.on("click", function (e) {
                        var floorID = $scope.currentMapFloor.FloorID;
                        var currentPoint = map.project(e.latlng);

                        var filtered = $linq.Enumerable().From($scope.mapOrganizations).Select(i => {
                            return {
                                Organization: i.Value,
                                Distance: currentPoint.distanceTo(map.project(i.Value.marker._latlng))
                            };
                        }).Where(i => i.Distance <= 50 && i.Organization.FloorID === floorID).OrderBy(i => i.Distance).ToArray();

                        if (filtered[0] !== undefined) {
                            if ($rootScope.currentOrganization && $rootScope.currentOrganization.OrganizationID === filtered[0].Organization.OrganizationID || filtered[0].Organization.OrganizationID === $rootScope.currentTerminal.OrganizationTerminal.OrganizationID) {
                                return;
                            }
                            clickToOrganization(filtered[0].Organization.OrganizationID)
                            // if ($state.current.name == "navigation.searchResult")
                            //     $state.go("navigation.searchResult.organization", { OrganizationID: filtered[0].Organization.OrganizationID });
                            // else
                            //     $state.go("navigation.mainMenu.organization", { OrganizationID: filtered[0].Organization.OrganizationID });
                        }
                    });
                    $scope.$watch('options.orginalAngel', function (n, o) {
                        if (n === o)
                            return;
                        if ($scope.options.orginalAngel)
                            map.setBearing(0);
                        else
                            map.setBearing($rootScope.currentTerminal.LookDirectionAngleDegrees);
                        //setView({ fullScreen: $state.current.name == "navigation" });
                        setBounds();
                    });
                    // Задаем блокирование масштабирования
                    map.on("zoomend", function () {
                        $scope.options.zoom = this.getZoom();
                        // if (($scope.options.zoom === $scope.options.minZoom && $rootScope.formatTheme != "formatTheme_horizontalSmall") || $scope.options.zoom === $scope.options.maxZoom) {
                        //     $timeout(function () { setView(); }, 1000);
                        //     $timeout(function () { setView(); }, 1400);
                        // }
                        $scope.minusDisable = $scope.options.zoom <= map.getMinZoom();
                        $scope.plusDisable = $scope.options.zoom >= map.getMaxZoom();
                        if (!$rootScope.$$phase)
                            $scope.$parent.$digest();
                    });

                    function clickToOrganization(orgID) {
                        switch ($state.current.name) {
                            case "navigation.searchResult":
                                $state.go("navigation.searchResult.organization", { OrganizationID: orgID }, { inherit: true });
                                break;
                            case "navigation.searchResult.organization":
                                $state.go("navigation.searchResult.organization", { OrganizationID: orgID }, { inherit: true, notify: false });
                                break;
                            case "navigation.mainMenu":
                                $state.go("navigation.mainMenu.organization", { OrganizationID: orgID }, { inherit: true });
                                break;
                            case "navigation.mainMenu.organization":
                                $state.go("navigation.mainMenu.organization", { OrganizationID: orgID }, { inherit: true, notify: false });
                                break;
                            case "navigation.closedResult":
                                $state.go("navigation.closedResult.organization", { OrganizationID: orgID }, { inherit: true });
                                break;
                            default:
                                $state.go("navigation.organization", { OrganizationID: orgID }, { inherit: true });
                                break;
                        }
                    };

                    function getIcon(org, selected) {
                        let cls = ($rootScope.currentOrganization !== undefined && org.OrganizationID === $rootScope.currentOrganization.OrganizationID) || selected ? ' _selected"' : '';
                        let html;
                        if ($rootScope.currentTerminal.OrganizationID === org.OrganizationID) {
                            html = `<div data-org-id="${org.OrganizationID}"><img style="width:40px;margin-top: -60px;margin-left: -10px;" src="Content/images/youHere.png"/></div>`;
                        } else {
                            //Тип организации дополнительно
                            if (org.OrganizationType === 5) {
                                if (org.CategoryOrganization.length != 0) {
                                    let cat = org.CategoryOrganization[0];
                                    if (cat.CategoryID === 1751)
                                        html = `<div><img class="marker__image marker__wc${cls}" src="${settings.webApiBaseUrl}/Category/${cat.CategoryID}/Logo" data-org-id="${org.OrganizationID}"/></div>`;
                                    else
                                        if (cat.CategoryID === 1570)
                                            html = ``;
                                        else
                                            html = `<div><img class="marker__image${cls}" src="${settings.webApiBaseUrl}/Category/${cat.CategoryID}/Logo" data-org-id="${org.OrganizationID}"/></div>`;
                                }
                            }
                            else
                                if (org.MapSize > 0 && org.SignPointRadius == null)
                                    //html = `<div><span class="marker__text">${org.Name}</span></div><svg><circle class="marker__item${cls}" cx="5" cy="5" r="5" data-org-id="${org.OrganizationID}"/></svg>`;
                                    html = `<div><svg><circle class="marker__item${cls}" cx="5" cy="5" r="5" data-org-id="${org.OrganizationID}"/></svg></div>`;
                                else
                                    html = `<div><svg><circle class="marker__item${cls}" cx="5" cy="5" r="5" data-org-id="${org.OrganizationID}"/></svg></div>`;
                        }
                        return L.divIcon({ className: 'marker', html: html, iconSize: [16, 16] });
                    }
                    function getZIndex(item) {
                        //Вы
                        if ($rootScope.currentTerminal.OrganizationID === item.OrganizationID)
                            return 400;
                        //Сервистные
                        if (item.OrganizationType === 5)
                            return 1;
                        return 10;
                    };
                    let init = $rootScope.$watchCollection('organizations', function () {
                        if ($rootScope.organizations === undefined || $scope.mapOrganizations || $scope.mapFloors) {
                            return;
                        };
                        $scope.mapFloors = {};
                        $scope.mapOrganizations = {};
                        //var promises = [];
                        $rootScope.floors.forEach(item => {
                            let size = map.getSize();
                            let range = getZoomRange(item.Width, item.Height, size.x * 0.3, size.y);
                            map.options.maxZoom = map.options.minZoom + range;
                            //var image = getImage(item.File);
                            //promises.push(image);
                            //image.then(function (value) {
                            var value = { width: item.Width, height: item.Height };
                            var southWest = map.unproject([-value.width / 2, value.height / 2], map.getMaxZoom());
                            var northEast = map.unproject([value.width / 2, -value.height / 2], map.getMaxZoom());
                            item.layer = L.imageOverlay(`${settings.webApiBaseUrl}/Floor/${item.FloorID}/File`, [southWest, northEast]);
                            item.layerGroup = L.featureGroup();
                            item.pathGroup = L.layerGroup();
                            $scope.mapFloors[item.FloorID] = item;
                            southWest = map.unproject([-value.width / 2, value.height / 2], 18);
                            northEast = map.unproject([value.width / 2, -value.height / 2], 18);
                            item.boundSmall = new L.LatLngBounds(southWest, northEast);
                            southWest = map.unproject([-value.width / 1, value.height / 1], map.getMaxZoom());
                            northEast = map.unproject([value.width / 1, -value.height / 1], map.getMaxZoom());
                            item.bound = new L.LatLngBounds(southWest, northEast);
                            //map.setMaxBounds(item.layer.getBounds());
                            //L.rectangle(item.layer.getBounds(), { color: "#f77800", weight: 1 }).addTo(map);
                            //});
                        });
                        //$q.all(promises).then(function () {

                        //Чтобы поставить маркер для терминала без отображения терминалов
                        {
                            var terminalOrg = $rootScope.currentTerminal.OrganizationTerminal;
                            var position = map.unproject([terminalOrg.Longitude, terminalOrg.Latitude], map.getMaxZoom());
                            let markerIcon = getIcon(terminalOrg, false);
                            terminalOrg.marker = L.marker(position, {
                                icon: markerIcon,
                                title: terminalOrg.Name,
                                iconSize: [16, 16],
                                zIndexOffset: getZIndex(terminalOrg)
                            });
                            $scope.mapFloors[terminalOrg.FloorID].layerGroup.addLayer(terminalOrg.marker, { pane: 'tilePane' });
                            $scope.mapOrganizations[terminalOrg.OrganizationID] = terminalOrg;
                        }

                        //Наносим организации
                        $scope.options.zoom = map.getZoom();
                        $rootScope.organizations.forEach(item => {
                            var position = map.unproject([item.Longitude, item.Latitude], map.getMaxZoom());
                            let markerIcon = getIcon(item, false);
                            item.marker = L.marker(position, {
                                icon: markerIcon,
                                title: item.Name,
                                iconSize: [16, 16],
                                zIndexOffset: getZIndex(item)
                            });
                            //item.marker.setZIndexOffset($rootScope.currentTerminal.OrganizationID === item.OrganizationID ? 100 : 20);
                            //item.marker.setRadius(5);
                            $scope.mapFloors[item.FloorID].layerGroup.addLayer(item.marker, { pane: 'tilePane' });
                            $scope.mapOrganizations[item.OrganizationID] = item;
                            //Добавляем оргии с надписями поверх

                            if (item.SignPointLongitude && item.SignPointLatitude && item.SignPointRadius) {
                                var markerText = L.Marker.zoomingMarker(item);
                                markerText.on("click", function (e) {
                                    $rootScope.currentOrganization = item;
                                    clickToOrganization(item.OrganizationID);
                                });
                                $scope.mapFloors[item.FloorID].layerGroup.addLayer(markerText);
                            }

                        });
                        //Устанавливаем терминал
                        $scope.setFloor($rootScope.currentTerminal.Organization.Floor.FloorID);
                        //map.setBearing($rootScope.currentTerminal.LookDirectionAngleDegrees);
                        setView();
                        init();
                        //});

                    });
                    $scope.getCount = function (floorID) {
                        return $scope.selectedOrganizations === undefined ? 0 : $scope.selectedOrganizations.filter(i => i.FloorID === floorID).length;
                    };
                    //Выбранна организация
                    var currentOrganizationHandler = $rootScope.$watch('currentOrganization', function (nw, old) {
                        if ($scope.selectedOrganizations !== undefined) {
                            $scope.selectedOrganizations.forEach(org => {
                                let markerIcon = getIcon(org, false);
                                $scope.mapOrganizations[org.OrganizationID].marker.setIcon(markerIcon);
                                //map.removeLayer($scope.mapOrganizations[org.OrganizationID].marker);
                            });
                            $scope.selectedOrganizations = undefined;

                        }

                        if ($rootScope.currentOrganization !== undefined) {
                            let markerIcon = getIcon($rootScope.currentOrganization, true);
                            //if ($scope.mapOrganizations[$rootScope.currentOrganization.OrganizationID] !== undefined) {
                            $scope.mapOrganizations[$rootScope.currentOrganization.OrganizationID].marker.setIcon(markerIcon);
                            $scope.selectedOrganizations = [$rootScope.currentOrganization];
                            //Отрисовка бегушего человека
                            $rootScope.currentPath = $rootScope.mapGraph.findPath($rootScope.currentTerminal.OrganizationTerminal.Longitude, $rootScope.currentTerminal.OrganizationTerminal.Latitude, $rootScope.currentTerminal.Organization.Floor.FloorID, $rootScope.currentOrganization.Longitude, $rootScope.currentOrganization.Latitude, $rootScope.currentOrganization.FloorID);
                            $scope.setFloor($rootScope.currentOrganization.FloorID);
                            //}
                            // else {
                            //     $timeout(function () {
                            //         $scope.mapOrganizations[$rootScope.currentOrganization.OrganizationID].marker.setIcon(markerIcon);
                            //         $scope.selectedOrganizations = [$rootScope.currentOrganization];
                            //         //Отрисовка бегушего человека
                            //         $rootScope.currentPath = $rootScope.mapGraph.findPath($rootScope.currentTerminal.Organization.Longitude, $rootScope.currentTerminal.Organization.Latitude, $rootScope.currentTerminal.Organization.Floor.FloorID, $rootScope.currentOrganization.Longitude, $rootScope.currentOrganization.Latitude, $rootScope.currentOrganization.FloorID);
                            //     }, 500);
                            // }
                        } else {
                            //Может быть когда мы переходим из детального представления в список
                            selectOrganizations();
                            delete $rootScope.currentPath;
                        }
                    });
                    //Отфильтрованны организации
                    $rootScope.$watchCollection('currentOrganizations', selectOrganizations);
                    function selectOrganizations(nw, old) {
                        //Если выбранна организация то нельзя выбирать несколько
                        if ($rootScope.currentOrganizations !== undefined && $rootScope.currentOrganization !== undefined) {
                            return;
                        }
                        if ($scope.selectedOrganizations !== undefined) {
                            $scope.selectedOrganizations.forEach(org => {
                                let markerIcon = getIcon(org, false);
                                $scope.mapOrganizations[org.OrganizationID].marker.setIcon(markerIcon);
                            });
                            $scope.selectedOrganizations = undefined;
                        }
                        if ($rootScope.currentOrganizations !== undefined) {
                            $rootScope.currentOrganizations.forEach(org => {
                                let markerIcon = getIcon(org, true);
                                $scope.mapOrganizations[org.OrganizationID].marker.setIcon(markerIcon);
                            });
                            $scope.selectedOrganizations = $rootScope.currentOrganizations
                        }
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
                                currentLine.push(map.unproject([path.x, path.y], maxZoom));

                            });
                            let angle = $scope.options.orginalAngel == true ? 0 : ($rootScope.currentTerminal.LookDirectionAngleDegrees * 3.14 / 180);

                            //Теперь строим сами линии
                            currentLines.forEach((value, key, m) => {

                                let line = L.polyline(value, { color: 'red', className: 'path' });

                                let myMovingMarker = L.Marker.movingMarker(value, settings.manVelocity, { loop: true, autostart: true, angle: map._bearing, zIndexOffset: 700 });
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
                    let resetHandler = $rootScope.$on('resetMap', function () {
                        //map.fitBounds($scope.currentMapFloor.bound);
                        if ($state.current.resetMap)
                            $scope.options.reset($state.current);
                    });
                    $scope.$on("$destroy", function () {
                        //console.log('destroy map');
                        if ($scope.selectedOrganizations !== undefined) {
                            $scope.selectedOrganizations.forEach(org => {
                                let markerIcon = getIcon(org, false);
                                $scope.mapOrganizations[org.OrganizationID].marker.setIcon(markerIcon);
                            });
                            $scope.selectedOrganizations = undefined;
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
                            //delete $scope.currentMapFloor.layer;
                            //delete $scope.currentMapFloor.layerGroup;
                            //delete $scope.currentMapFloor.pathGroup;
                            //delete $scope.currentMapFloor;
                        }
                        changeStatehandler();
                        resetHandler();
                        formatThemeHandler();
                        currentOrganizationHandler();
                        currentPathHandler();
                    });
                    $scope.zoomIn = function () {
                        map.zoomIn();
                    };
                    $scope.zoomOut = function () {
                        map.zoomOut();
                    };
                    $scope.setFloor = function (floorID) {
                        //if (floorID === undefined || ($scope.currentMapFloor !== undefined && floorID === $scope.currentMapFloor.FloorID))
                        //    return;
                        var floor = $scope.mapFloors[floorID];
                        if (floor !== undefined) {
                            if ($scope.currentMapFloor !== undefined) {
                                //if ($scope.currentMapFloor.layer && $scope.currentMapFloor.layer._map)
                                map.removeLayer($scope.currentMapFloor.layer);
                                //if ($scope.currentMapFloor.pathGroup && $scope.currentMapFloor.pathGroup._map)
                                map.removeLayer($scope.currentMapFloor.pathGroup);
                                //if ($scope.currentMapFloor.layerGroup && $scope.currentMapFloor.layerGroup._map)
                                map.removeLayer($scope.currentMapFloor.layerGroup);

                            }
                            floor.layer.addTo(map);
                            floor.pathGroup.addTo(map);
                            floor.layerGroup.addTo(map);
                            //map.setMaxBounds($rootScope.formatTheme == "formatTheme_horizontalSmall" ? floor.boundSmall : floor.bound);

                        };
                        $scope.currentMapFloor = floor;
                        //L.rectangle($scope.currentMapFloor.layer.getBounds(), { color: "#f77800", weight: 1 }).addTo(map);
                        //map.setMaxBounds($scope.currentMapFloor.layer.getBounds());
                        setBounds();
                    };
                }
            }
        }
    ]);
})();