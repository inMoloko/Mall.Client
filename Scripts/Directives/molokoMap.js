(function () {
    "use strict";
    // L.Marker.prototype.__setPos = L.Marker.prototype._setPos;
    // L.Marker.prototype._setPos = function () {
    //     L.Marker.prototype.__setPos.apply(this, arguments);
    //     this._zIndex = this.options.zIndexOffset;
    //     this._resetZIndex();
    // };
    const constants = {
        Terminal: 0,
        Link: 1,
        Service: 2
    };

    angular.module('app').directive("molokoMap", [
        '$rootScope', '$http', '$q', 'settings', '$linq', '$state', '$stateParams', '$timeout', function ($rootScope, $http, $q, settings, $linq, $state, $stateParams, $timeout) {
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
                        $scope.options.maxZoom = 19;
                    if (!$scope.options.orginalAngel)
                        $scope.options.orginalAngel = false;
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
                        zoomSnap: 0,
                        bearing:30
                    });
                    //console.log('Create map');
                    map.setView([0, 0], 1);
                    //Сброс карты
                    $scope.options.reset = function (data) {
                        $scope.options.orginalAngel = false;

                        $scope.setFloor($rootScope.currentTerminal.TerminalMapObject[0].MapObject.FloorID);
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
                        let bounds = $scope.currentMapFloor.layerGroup.getBounds();
                        let rad = $rootScope.currentTerminal ? $rootScope.currentTerminal.LookDirectionAngleDegrees : 0;
                        rad = $scope.options.orginalAngel == true ? 0 : rad;

                        let size = map.getSize();
                        let width = $state.current.name == "navigation" ? 50 : size.x * 0.3;
                        //calculateBounds();
                        map.fitBounds(bounds, {
                            paddingTopLeft: [width, 50],
                            paddingBottomRight: [50, 50],
                            reset: false,
                            animate: false
                        });
                        let zoom = map.getBoundsZoom(bounds);
                        //map.fitBounds(bounds, { reset: false, animate: false });
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

                        // var filtered = $linq.Enumerable().From($scope.mapOrganizations).Select(i => {
                        //     return {
                        //         Organization: i.Value,
                        //         Distance: currentPoint.distanceTo(map.project(i.Value.marker._latlng))
                        //     };
                        // }).Where(i => i.Distance <= 50 && i.Organization.FloorID === floorID).OrderBy(i => i.Distance).ToArray();

                        var filtered = $linq.Enumerable().From($scope.mapFloors[floorID].floorMapObjects).Select(i => {
                            return {
                                OrganizationID: i.Key,
                                MapObject: $linq.Enumerable().From(i.Value).Select(j => {
                                    return {
                                        Distance: currentPoint.distanceTo(map.project(j.position)),
                                        MapObjectID: j.mapObjectID
                                    };
                                }).OrderBy(j => j.Distance).FirstOrDefault()
                            };
                        }).Where(i => i.MapObject.Distance <= 50).OrderBy(i => i.MapObject.Distance).ToArray();

                        if (filtered[0] !== undefined) {
                            if ($rootScope.currentOrganization && $rootScope.currentOrganization.OrganizationID === filtered[0].OrganizationID || filtered[0].OrganizationID === $rootScope.currentTerminal.OrganizationID) {
                                return;
                            }
                            clickToOrganization(filtered[0].OrganizationID, filtered[0].MapObject.MapObjectID);
                        }
                    });
                    var _orginalAngel = $scope.$watch('options.orginalAngel', function (n, o) {
                        if (n === o)
                            return;
                        if ($scope.options.orginalAngel)
                            map.setBearing(0);
                        else
                            map.setBearing($rootScope.currentTerminal.LookDirectionAngleDegrees);
                        //setView({ fullScreen: $state.current.name == "navigation" });
                        setBounds();
                    });
                    var tmprect;

                    function calculateBounds(offset) {
                        let full = $state.current.name == "navigation";

                        var tb = $scope.currentMapFloor.layer.getBounds();

                        var s1 = map.containerPointToLatLng(L.point(0, 0));
                        var s2 = map.containerPointToLatLng(L.point(offset || 620, 0));
                        var s = s2.lng - s1.lng;

                        s2 = map.containerPointToLatLng(L.point(50, 0));
                        let p = s2.lng - s1.lng;
                        var maxBoundsSouthWest = new L.LatLng(tb.getSouthWest().lat, full ? tb.getSouthWest().lng : tb.getSouthWest().lng - s);
                        var maxBoundsNorthEast = new L.LatLng(tb.getNorthEast().lat, tb.getNorthEast().lng);

                        let bounds = new L.LatLngBounds(maxBoundsSouthWest, maxBoundsNorthEast);
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

                    function clickToOrganization(orgID, mapObjectID) {
                        switch ($state.current.name) {
                            case "navigation.searchResult":
                                $state.go("navigation.searchResult.organization", {
                                    OrganizationID: orgID,
                                    Filter: $stateParams.Filter,
                                    CategoryID: $stateParams.CategoryID,
                                    MapObjectID: mapObjectID
                                }, {inherit: true, reload: true});
                                break;
                            case "navigation.searchResult.organization":
                                $state.go("navigation.searchResult.organization", {
                                    OrganizationID: orgID,
                                    Filter: $stateParams.Filter,
                                    CategoryID: $stateParams.CategoryID,
                                    MapObjectID: mapObjectID
                                }, {inherit: true, notify: false, reload: true});
                                break;
                            case "navigation.mainMenu":
                                $state.go("navigation.mainMenu.organization", {
                                    OrganizationID: orgID,
                                    Filter: $stateParams.Filter,
                                    CategoryID: $stateParams.CategoryID,
                                    MapObjectID: mapObjectID
                                }, {inherit: true, reload: true});
                                break;
                            case "navigation.mainMenu.organization":
                                $state.go("navigation.mainMenu.organization", {
                                    OrganizationID: orgID,
                                    Filter: $stateParams.Filter,
                                    CategoryID: $stateParams.CategoryID,
                                    MapObjectID: mapObjectID
                                }, {inherit: true, notify: false, reload: true});
                                break;
                            case "navigation.closedResult":
                                $state.go("navigation.closedResult.organization", {
                                    OrganizationID: orgID,
                                    Filter: $stateParams.Filter,
                                    CategoryID: $stateParams.CategoryID,
                                    MapObjectID: mapObjectID
                                }, {inherit: true, reload: true});
                                break;
                            default:
                                $state.go("navigation.organization", {
                                    OrganizationID: orgID,
                                    Filter: $stateParams.Filter,
                                    CategoryID: $stateParams.CategoryID,
                                    MapObjectID: mapObjectID
                                }, {inherit: true, reload: true});
                                break;
                        }
                    };

                    function getIcon(org, selected, mapObjectID) {
                        let cls = ($rootScope.currentOrganization !== undefined && org.OrganizationID === $rootScope.currentOrganization.OrganizationID) || selected ? ' _selected"' : '';
                        let html;
                        if ($rootScope.currentTerminal.OrganizationID === org.OrganizationID) {
                            html = `<div data-org-id="${org.OrganizationID}" data-map-id="${mapObjectID}"><img style="width:40px;margin-top: -60px;margin-left: -10px;" src="Content/images/youHere.png"/></div>`;
                        } else {
                            //Тип организации дополнительно
                            //if (org.OrganizationType === 5) {
                            if (org.CategoryOrganization.length!=0 && org.CategoryOrganization.some(i=>i.Category.ServiceCategoryType == constants.Service)) {
                                if (org.CategoryOrganization.length != 0) {
                                    let cat = org.CategoryOrganization[0];
                                    if (org.CategoryOrganization.map(i => i.CategoryID).includes($rootScope.serviceCategories.toilet))
                                        html = `<div><img class="marker__image marker__wc${cls}" src="${settings.webApiBaseUrl}/Category/${cat.CategoryID}/Logo" data-org-id="${org.OrganizationID}" data-map-id="${mapObjectID}"/></div>`;
                                    // else if (cat.CategoryID === $rootScope.serviceCategories.terminal)
                                    //     html = ``;
                                    else
                                        html = `<div><img class="marker__image${cls}" src="${settings.webApiBaseUrl}/Category/${cat.CategoryID}/Logo" data-org-id="${org.OrganizationID}" data-map-id="${mapObjectID}"/></div>`;
                                }
                            }
                            else //if (org.MapSize > 0 && org.SignPointRadius == null)
                            //html = `<div><span class="marker__text">${org.Name}</span></div><svg><circle class="marker__item${cls}" cx="5" cy="5" r="5" data-org-id="${org.OrganizationID}"/></svg>`;
                                html = `<div><svg><circle class="marker__item${cls}" cx="5" cy="5" r="5" data-org-id="${org.OrganizationID}" data-map-id="${mapObjectID}"/></svg></div>`;
                            //else
                            //    html = `<div><svg><circle class="marker__item${cls}" cx="5" cy="5" r="5" data-org-id="${org.OrganizationID}" data-map-id="${mapObjectID}"/></svg></div>`;
                        }
                        return L.divIcon({className: 'marker', html: html, iconSize: [16, 16]});
                    }

                    function getZIndex(item) {
                        //Вы
                        if ($rootScope.currentTerminal.OrganizationID === item.OrganizationID)
                            return 400;
                        //Сервистные
                        if (item.CategoryOrganization.length!=0 && item.CategoryOrganization.some(i=>i.Category.ServiceCategoryType == constants.Service))
                            return 1;
                        return 10;
                    };
                    let init = $rootScope.$watchCollection('organizations', function () {
                        if ($rootScope.organizations === undefined || $scope.mapOrganizations || $scope.mapFloors) {
                            return;
                        }
                        ;
                        $scope.mapFloors = {};
                        $scope.mapOrganizations = {};
                        $scope.mapObjects = {};
                        //var promises = [];
                        $rootScope.floors.forEach(item => {
                            let size = map.getSize();
                            let range = getZoomRange(item.Width, item.Height, size.x * 0.3, size.y);
                            //TODO Тут надо подумать пока будем брать максимальный зум
                            if (map.options.maxZoom < map.options.minZoom + range)
                                map.options.maxZoom = map.options.minZoom + range;


                            //var image = getImage(item.File);
                            //promises.push(image);
                            //image.then(function (value) {
                            var value = {width: item.Width, height: item.Height};
                            var southWest = map.unproject([-value.width / 2, value.height / 2], map.getMaxZoom());
                            var northEast = map.unproject([value.width / 2, -value.height / 2], map.getMaxZoom());


                            if (!settings.terminalID)
                                item.layer = L.imageOverlay(`${settings.webApiBaseUrl}/Floor/${item.FloorID}/File`, [southWest, northEast]);
                            else
                                item.layer = L.imageOverlay(`${settings.webApiBaseUrl}/Floor/${item.FloorID}/File?TerminalID=${settings.terminalID}`, [southWest, northEast]);
                            item.layerGroup = L.featureGroup();
                            item.pathGroup = L.layerGroup();
                            item.floorMapObjects = {};
                            $scope.mapFloors[item.FloorID] = item;

                        });
                        //$q.all(promises).then(function () {

                        //Чтобы поставить маркер для терминала без отображения терминалов
                        {
                            var terminalOrg = $rootScope.currentTerminal.TerminalMapObject[0].MapObject;
                            var position = map.unproject([terminalOrg.Longitude, terminalOrg.Latitude], map.getMaxZoom());
                            let markerIcon = getIcon($rootScope.currentTerminal, false);
                            terminalOrg.marker = L.marker(position, {
                                icon: markerIcon,
                                title: terminalOrg.Name,
                                iconSize: [16, 16],
                                zIndexOffset: getZIndex($rootScope.currentTerminal)
                            });
                            $scope.mapFloors[terminalOrg.FloorID].layerGroup.addLayer(terminalOrg.marker, {pane: 'tilePane'});
                            $scope.mapOrganizations[terminalOrg.OrganizationID] = terminalOrg;
                        }

                        //Наносим организации
                        $scope.options.zoom = map.getZoom();
                        $rootScope.organizations.forEach(item => {
                            item.OrganizationMapObject.forEach(mapObject => {
                                if (mapObject.MapObject.ParamsAsJson && mapObject.MapObject.ParamsAsJson.SignPointRadius) {
                                    var markerText = L.Marker.zoomingMarker(mapObject.MapObject);
                                    markerText.on("click", function (e) {
                                        $rootScope.currentOrganization = item;
                                        clickToOrganization(item.OrganizationID);
                                    });
                                    if($scope.mapFloors[mapObject.MapObject.FloorID])
                                        $scope.mapFloors[mapObject.MapObject.FloorID].layerGroup.addLayer(markerText);
                                }
                                else {
                                    var position = map.unproject([mapObject.MapObject.Longitude, mapObject.MapObject.Latitude], map.getMaxZoom());
                                    let markerIcon = getIcon(item, false, mapObject.MapObject.MapObjectID);
                                    let marker = L.marker(position, {
                                        icon: markerIcon,
                                        title: item.Name,
                                        iconSize: [16, 16],
                                        zIndexOffset: getZIndex(item)
                                    });
                                    if (mapObject.MapObject.FloorID && $scope.mapFloors[mapObject.MapObject.FloorID]) {
                                        $scope.mapFloors[mapObject.MapObject.FloorID].layerGroup.addLayer(marker, {pane: 'tilePane'});
                                        if (!$scope.mapFloors[mapObject.MapObject.FloorID].floorMapObjects[item.OrganizationID])
                                            $scope.mapFloors[mapObject.MapObject.FloorID].floorMapObjects[item.OrganizationID] = [];

                                        $scope.mapFloors[mapObject.MapObject.FloorID].floorMapObjects[item.OrganizationID].push({
                                            position: position,
                                            mapObjectID: mapObject.MapObject.MapObjectID
                                        });
                                    }
                                }
                                $scope.mapObjects[mapObject.MapObject.MapObjectID] = mapObject.MapObject;
                            });

                            $scope.mapOrganizations[item.OrganizationID] = item;
                            //Добавляем оргии с надписями поверх

                            // if (item.SignPointLongitude && item.SignPointLatitude && item.SignPointRadius && item.FloorID) {
                            //     var markerText = L.Marker.zoomingMarker(item);
                            //     markerText.on("click", function (e) {
                            //         $rootScope.currentOrganization = item;
                            //         clickToOrganization(item.OrganizationID);
                            //     });
                            //     $scope.mapFloors[item.FloorID].layerGroup.addLayer(markerText);
                            // }

                        });
                        //Устанавливаем терминал
                        $scope.setFloor($rootScope.currentTerminal.TerminalMapObject[0].MapObject.FloorID);

                        init();
                    });
                    $scope.getCount = function (floorID) {
                        return $scope.selectedOrganizations === undefined ? 0 : $linq.Enumerable().From($scope.selectedOrganizations).SelectMany(i => i.OrganizationMapObject).Count(i => i.MapObject.FloorID == floorID);
                    };
                    function getOptimalPath(array) {
                        let paths = {};
                        let mapObject = $rootScope.currentTerminal.TerminalMapObject[0].MapObject;
                        //Надписи не учитывем для посторения
                        array = array.filter(i => !i.ParamsAsJson || !i.ParamsAsJson.SignText);
                        array.forEach(i => {
                            let path = $rootScope.mapGraph.findPath(mapObject.Longitude, mapObject.Latitude, mapObject.FloorID, i.Longitude, i.Latitude, i.FloorID);
                            let sum = path[path.length - 1].dksLength;
                            paths[i.MapObjectID] = {
                                path: path,
                                sum: sum,
                                object: i
                            };
                        });
                        let result = $linq.Enumerable().From(paths).OrderBy(i => i.Value.sum).FirstOrDefault();

                        return result ? result.Value : null;
                    }

                    //Очистить выделение маркеров
                    function clearSelect(selector) {
                        document.querySelectorAll('._selected').forEach(m => {
                            m.classList.remove('_selected');
                        });
                        let floorID = $scope.currentMapFloor.FloorID;
                        angular.forEach($scope.mapFloors, function (value, key) {
                            if (key != floorID)
                                value.clear = true;
                        });
                    }

                    //Выбранна организация
                    var currentOrganizationHandler = $rootScope.$watch('currentOrganization', function (nw, old) {
                        if ($scope.selectedOrganizations !== undefined) {
                            // $scope.selectedOrganizations.forEach(org => {
                            //     document.querySelectorAll('[data-org-id="' + org.OrganizationID + '"]').forEach(m => {
                            //         m.classList.remove('_selected');
                            //     });
                            // });
                            // angular.forEach($scope.mapFloors, function (value) {
                            //     let container = value.layer.getPane();
                            //     container.querySelectorAll('._selected').forEach(m => {
                            //         m.classList.remove('_selected');
                            //     });
                            // });
                            clearSelect();

                            // document.querySelectorAll('._selected').forEach(m => {
                            //     m.classList.remove('_selected');
                            // });
                            $scope.selectedOrganizations = undefined;
                        }

                        if ($rootScope.currentOrganization) {
                            //let markerIcon = getIcon($rootScope.currentOrganization, true);
                            //if ($scope.mapOrganizations[$rootScope.currentOrganization.OrganizationID] !== undefined) {
                            let mapObjects;
                            if ($stateParams.MapObjectID) {
                                document.querySelectorAll('[data-map-id="' + $stateParams.MapObjectID + '"]').forEach(m => {
                                    m.classList.add('_selected');
                                });
                                mapObjects = [$scope.mapObjects[$stateParams.MapObjectID]];
                            }
                            else {
                                document.querySelectorAll('[data-org-id="' + $rootScope.currentOrganization + '"]').forEach(m => {
                                    m.classList.add('_selected');
                                });
                                mapObjects = $rootScope.currentOrganization.OrganizationMapObject.map(i => i.MapObject);
                            }
                            // $scope.mapOrganizations[$rootScope.currentOrganization.OrganizationID].marker.setIcon(markerIcon);

                            $scope.selectedOrganizations = [$rootScope.currentOrganization];
                            //Отрисовка бегушего человека
                            //$rootScope.currentPath = $rootScope.mapGraph.findPath($rootScope.currentTerminal.OrganizationTerminal.Longitude, $rootScope.currentTerminal.OrganizationTerminal.Latitude, $rootScope.currentTerminal.Organization.Floor.FloorID, $rootScope.currentOrganization.Longitude, $rootScope.currentOrganization.Latitude, $rootScope.currentOrganization.FloorID);

                            let result = getOptimalPath(mapObjects);
                            //Может быть клик на надпись, но нет входа
                            if(!result){
                                delete $rootScope.currentPath;
                            }
                            else {
                                $rootScope.currentPath = result.path;
                                $scope.setFloor(result.object.FloorID);
                            }


                        } else {
                            //Может быть когда мы переходим из детального представления в список
                            selectOrganizations();
                            delete $rootScope.currentPath;
                        }
                    });
                    //Отфильтрованны организации
                    var _currentOrganizations = $rootScope.$watchCollection('currentOrganizations', selectOrganizations);

                    function selectOrganizations(nw, old) {
                        //Если выбранна организация то нельзя выбирать несколько
                        if ($rootScope.currentOrganizations !== undefined && $rootScope.currentOrganization !== undefined) {
                            return;
                        }
                        if (nw == undefined && old == undefined)
                            return;
                        if ($scope.selectedOrganizations !== undefined) {
                            $scope.selectedOrganizations.forEach(org => {
                                // let markerIcon = getIcon(org, false);
                                // if ($scope.mapOrganizations)
                                //     $scope.mapOrganizations[org.OrganizationID].marker.setIcon(markerIcon);
                                clearSelect();
                                // document.querySelectorAll('[data-org-id="' + org.OrganizationID + '"]').forEach(m => {
                                //     m.classList.remove('_selected');
                                // });
                            });
                            $scope.selectedOrganizations = undefined;
                        }
                        if ($rootScope.currentOrganizations !== undefined) {
                            $rootScope.currentOrganizations.forEach(org => {
                                // let markerIcon = getIcon(org, true);
                                // if ($scope.mapOrganizations)
                                //     $scope.mapOrganizations[org.OrganizationID].marker.setIcon(markerIcon);
                                document.querySelectorAll('[data-org-id="' + org.OrganizationID + '"]').forEach(m => {
                                    m.classList.add('_selected');
                                });
                            });
                            $scope.selectedOrganizations = $rootScope.currentOrganizations;
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

                                let line = L.polyline(value, {color: 'red', className: 'path'});

                                let myMovingMarker = L.Marker.movingMarker(value, settings.manVelocity, {
                                    loop: true,
                                    autostart: true,
                                    angle: map._bearing,
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
                        changeStatehandler();
                        resetHandler();
                        formatThemeHandler();
                        currentOrganizationHandler();
                        currentPathHandler();
                        _orginalAngel();
                        _currentOrganizations();
                        map.removeEventListener();
                        map.remove();
                        map = null;
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
                            if (floor.clear) {
                                document.querySelectorAll('._selected').forEach(m => {
                                    m.classList.remove('_selected');
                                });
                                delete floor.clear;
                            }
                            //console.time('selectedOrganizations');
                            if ($scope.selectedOrganizations && $scope.selectedOrganizations.length != 0) {
                                $scope.selectedOrganizations.forEach(org => {
                                    document.querySelectorAll('[data-org-id="' + org.OrganizationID + '"]').forEach(m => {
                                        m.classList.add('_selected');
                                    });
                                });
                            }
                            //console.timeEnd('selectedOrganizations');
                        }
                        $scope.currentMapFloor = floor;
                        setBounds();
                    };
                }
            };
        }
    ]);
})();