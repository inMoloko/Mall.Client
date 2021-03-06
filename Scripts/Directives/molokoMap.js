(function () {
    "use strict";

    const constants = {
        Terminal: 0,
        Link: 1,
        Service: 2
    };
   L.Map.addInitHook('addHandler', 'tap', L.Map.Tap);

    angular.module('app').directive("molokoMap", [
        '$rootScope', '$http', '$q', 'settings', '$linq', '$state', '$stateParams', '$timeout', 'dbService', function ($rootScope, $http, $q, settings, $linq, $state, $stateParams, $timeout, dbService) {
            return {
                restrict: 'E',
                replace: true,
                scope: {
                    options: '=options'
                },
                templateUrl: 'blocks/molokoMap/molokoMap.html',
                link: function ($scope, element, attrs) {
                    $scope.rootScope = $rootScope;
                    if (!$scope.options)
                        $scope.options = {};
                    if (!$scope.options.minZoom)
                        $scope.options.minZoom = 15;
                    if (!$scope.options.maxZoom)
                        $scope.options.maxZoom = 21;
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
                        //crs: L.CRS.Simple,
                        inertia: false,
                        bounceAtZoomLimits: true,
                        fadeAnimation: false,
                    });
                    //map.setBearing(90);
                    // map.on('moveend', e => {
                    //     console.log(e.target.dragging._draggable._newPos, map.getPixelOrigin(), map.getPixelBounds());
                    // });
                    //console.log('Create map');
                    map.setView([0, 0], 1);
                    //Сброс карты
                    $scope.options.reset = function (data) {
                        $scope.options.orginalAngel = false;

                        $scope.setFloor($rootScope.currentTerminal.FloorID);
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

                    function getXOffset() {
                        let match = document.querySelector('.leaflet-pane.leaflet-map-pane').style.transform.match(/translate3d\((.+)px,(.+)px,(.+)px\)/);
                        return parseInt(match[1]);
                    }

                    function setBounds() {
                        map.invalidateSize();
                        let bounds = $scope.currentMapFloor.layerGroup.getBounds();
                        let rad = $rootScope.currentTerminal ? $rootScope.currentTerminal.LookDirectionAngleDegrees : 0;
                        rad = $scope.options.orginalAngel == true ? 0 : rad;

                        let size = map.getSize();
                        let width = $state.current.name == "navigation" ? 50 : 620;

                        //map._size.x = 1920-600;
                        map.fitBounds(bounds, {
                            paddingTopLeft: [50, 50],
                            paddingBottomRight: [50, 50],
                        });

                        map.setAbsoluteOffset({x: width / 2, y: 0});

                        calculateBounds();
                        return;

                        // let bearing = map.getBearing();
                        // if (bearing === 180) {
                        //     map.fitBounds(bounds, {
                        //         paddingTopLeft: [50, 50],
                        //         paddingBottomRight: [width, 50],
                        //     });
                        // } else if (bearing === 270) {
                        //     map.fitBounds(bounds, {
                        //         paddingTopLeft: [50, 50],
                        //         paddingBottomRight: [50, -width / 2],
                        //     });
                        // } else if (bearing === 90) {
                        //     map.fitBounds(bounds, {
                        //         paddingTopLeft: [50, -width / 2],
                        //         paddingBottomRight: [50, 50],
                        //     });
                        // } else {
                        //     map.fitBounds(bounds, {
                        //         paddingTopLeft: [width, 50],
                        //         paddingBottomRight: [50, 50],
                        //     });
                        // }
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
                    });
                    // Задаем обработчики событий
                    map.on("click", function (e) {
                        var floorID = $scope.currentMapFloor.FloorID;
                        var currentPoint = e.latlng;

                        let tmp = $linq.Enumerable().From($scope.mapFloors[floorID].layerGroup.getLayers())
                            .Where(i => i._organization)
                            .Select(i => {
                                return {
                                    Distance: currentPoint.distanceTo(i.getLatLng()),
                                    OrganizationID: i._organization.OrganizationID,
                                    MapObjectID: i._mapObject.MapObjectID
                                }
                            }).Where(i => i.Distance <= 50).OrderBy(i => i.Distance).FirstOrDefault();
                        if (tmp) {
                            if ($rootScope.currentOrganization && $rootScope.currentOrganization.OrganizationID === tmp.OrganizationID || tmp.OrganizationID === $rootScope.currentTerminal.OrganizationID) {
                                return;
                            }
                            clickToOrganization(tmp.OrganizationID, tmp.MapObjectID);
                        }
                    });
                    var tmprect;

                    function calculateBounds(offset) {

                        // map.setMaxBounds($scope.currentMapFloor.layer.getBounds());
                        // return;

                        let full = $state.current.name == "navigation";

                        var tb = $scope.currentMapFloor.layer.getBounds();

                        var s1 = map.containerPointToLatLng(L.point(0, 0));
                        var s2 = map.containerPointToLatLng(L.point(offset || 620, 0));
                        var s = s2.lng - s1.lng;

                        let maxBoundsSouthWest;
                        let maxBoundsNorthEast;

                        map.setMaxBounds(tb);
                        return;

                        // let bearing = map.getBearing();
                        // if (bearing === 180) {
                        //     maxBoundsSouthWest = new L.LatLng(tb.getSouthWest().lat, full ? tb.getSouthWest().lng : tb.getSouthWest().lng - s);
                        //     maxBoundsNorthEast = new L.LatLng(tb.getNorthEast().lat, tb.getNorthEast().lng);
                        //
                        // } else if (bearing === 270) {
                        //     s1 = map.containerPointToLatLng(L.point(0, 0));
                        //     s2 = map.containerPointToLatLng(L.point(0, offset || 620));
                        //     s = s2.lng - s1.lng;
                        //
                        //     maxBoundsSouthWest = new L.LatLng(tb.getSouthWest().lat, tb.getSouthWest().lng);
                        //     maxBoundsNorthEast = new L.LatLng(full ? tb.getNorthEast().lat : tb.getNorthEast().lat - s / 2, tb.getNorthEast().lng);
                        // } else if (bearing === 90) {
                        //     s1 = map.containerPointToLatLng(L.point(0, 0));
                        //     s2 = map.containerPointToLatLng(L.point(0, offset || 620));
                        //     s = s2.lng - s1.lng;
                        //     maxBoundsSouthWest = new L.LatLng(full ? tb.getSouthWest().lat : tb.getSouthWest().lat - s / 4, tb.getSouthWest().lng);
                        //     maxBoundsNorthEast = new L.LatLng(tb.getNorthEast().lat, tb.getNorthEast().lng);
                        // } else {
                        //     maxBoundsSouthWest = new L.LatLng(tb.getSouthWest().lat, full ? tb.getSouthWest().lng : tb.getSouthWest().lng - s);
                        //     maxBoundsNorthEast = new L.LatLng(tb.getNorthEast().lat, tb.getNorthEast().lng);
                        // }
                        //
                        //
                        // let bounds = new L.LatLngBounds(maxBoundsSouthWest, maxBoundsNorthEast);
                        //
                        // // let f = L.rectangle(bounds);
                        // // f.addTo(map);
                        // map.setMaxBounds(bounds);
                        //
                        // return bounds.getCenter();
                    }


                    // Задаем блокирование масштабирования
                    map.on("zoomend", function () {
                        $scope.options.zoom = this.getZoom();
                        $scope.minusDisable = $scope.options.zoom <= map.getMinZoom();
                        $scope.plusDisable = $scope.options.zoom >= map.getMaxZoom();


                        //calculateBounds();
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

                            if (org.ServiceCategoryType !== null) {
                                if (org.Categories.length != 0) {
                                    let cat = org.Categories[0];
                                    if (cat == $rootScope.serviceCategories.toilet)
                                        html = `<div><img class="marker__image marker__wc${cls}" src="${settings.resourceFolder}/Categories/${cat.CategoryID}.${cat.Category.LogoExtension}" data-org-id="${org.OrganizationID}" data-map-id="${mapObjectID}"/></div>`;
                                    // else if (cat.CategoryID === $rootScope.serviceCategories.terminal)
                                    //     html = ``;
                                    else
                                        html = `<div><img class="marker__image${cls}" src="${settings.resourceFolder}/Categories/${cat.CategoryID}.${cat.Category.LogoExtension}" data-org-id="${org.OrganizationID}" data-map-id="${mapObjectID}"/></div>`;
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
                        if (item.CategoryOrganization.length != 0 && item.CategoryOrganization.some(i => i.Category.ServiceCategoryType == constants.Service))
                            return 1;
                        return 10;
                    };
                    // let init = $rootScope.$watchCollection('organizations', function () {
                    //     if ($rootScope.organizations === undefined || $scope.mapOrganizations || $scope.mapFloors) {
                    //         return;
                    //     }
                    //     ;

                    dbService.getData().then(i => {
                        $scope.mapFloors = {};
                        $scope.mapOrganizations = {};
                        $scope.mapObjects = {};

                        $rootScope.currentTerminal = i.Floors.find(j => j.TerminalMapObject).TerminalMapObject;

                        map.setBearing($rootScope.currentTerminal.Params.LookDirectionAngleDegrees || 0);

                        //var promises = [];
                        i.Floors.forEach(item => {
                            if (item.Type !== null)
                                return;
                            // let size = map.getSize();
                            // let range = getZoomRange(item.Width, item.Height, size.x * 0.3, size.y);
                            // //TODO Тут надо подумать пока будем брать максимальный зум
                            // if (map.options.maxZoom < map.options.minZoom + range)
                            //     map.options.maxZoom = map.options.minZoom + range;


                            //var image = getImage(item.File);
                            //promises.push(image);
                            //image.then(function (value) {
                            var value = {width: item.Width, height: item.Height};
                            var southWest = map.unproject([-value.width / 2, value.height / 2], map.getMaxZoom());
                            var northEast = map.unproject([value.width / 2, -value.height / 2], map.getMaxZoom());

                            if (true) {
                                southWest = new L.LatLng(item.SouthWest.Latitude, item.SouthWest.Longitude);
                                northEast = new L.LatLng(item.NorthEast.Latitude, item.NorthEast.Longitude);
                            }
                            else {
                                if (!settings.terminalID)
                                    item.layer = L.imageOverlay(`${settings.resourceFolder}/Floors/${item.FloorID}.${item.FileExtension}`, [southWest, northEast]);
                                else
                                    item.layer = L.imageOverlay(`${settings.webApiBaseUrl}/Floor/${item.FloorID}/File?TerminalID=${settings.terminalID}`, [southWest, northEast]);
                            }

                            item.layer = L.imageOverlay(`${settings.resourceFolder}/Floors/${item.FloorID}.${item.FileExtension}`, new L.LatLngBounds(southWest, northEast));

                            item.layerGroup = L.featureGroup();
                            item.pathGroup = L.layerGroup();
                            item.floorMapObjects = {};
                            $scope.mapFloors[item.FloorID] = item;
                            item.OrganizationMapObjects.forEach(mapObject => {
                                let marker, category;
                                let position = map.convertPosition(mapObject.MapObject);
                                let mapObjectType = dbService.mapObjectGetTypeSync(i, mapObject);
                                switch (mapObjectType) {
                                    case 'zooming':
                                        marker = L.Marker.zoomingMarker(mapObject.MapObject);
                                        marker.on("click", function (e) {
                                            //$rootScope.currentOrganization = mapObject.Organization;
                                            clickToOrganization(mapObject.Organization.OrganizationID);
                                        });
                                        break;
                                    case 'toilet':
                                        category = mapObject.Organization.Categories.find(j => j.ServiceCategoryType != null);
                                        marker = L.marker(position, {
                                            icon: L.divIcon({
                                                className: 'marker',
                                                html: `<div><img class="marker__image marker__wc}" src="${settings.resourceFolder}/Categories/${category.CategoryID}.${category.LogoExtension}" data-org-id="${mapObject.Organization.OrganizationID}" data-map-id="${mapObject.MapObject.MapObjectID}"/></div>`,
                                                iconSize: [16, 16]
                                            }),
                                            title: mapObject.Organization.Name,
                                            iconSize: [16, 16],
                                            zIndexOffset: 10
                                        });
                                        marker._organization = mapObject.Organization;
                                        marker._mapObject = mapObject.MapObject;
                                        break;
                                    case 'serviceObject':
                                        category = mapObject.Organization.Categories.find(j => j.ServiceCategoryType != null);
                                        marker = L.marker(position, {
                                            icon: L.divIcon({
                                                className: 'marker',
                                                html: `<div><img class="marker__image" src="${settings.resourceFolder}/Categories/${category.CategoryID}.${category.LogoExtension}" data-org-id="${mapObject.Organization.OrganizationID}" data-map-id="${mapObject.MapObject.MapObjectID}"/></div>`,
                                                iconSize: [16, 16]
                                            }),
                                            title: mapObject.Organization.Name,
                                            iconSize: [16, 16],
                                            zIndexOffset: 1
                                        });
                                        marker._organization = mapObject.Organization;
                                        marker._mapObject = mapObject.MapObject;
                                        break;
                                    default:
                                        marker = L.marker(position, {
                                            icon: L.divIcon({
                                                className: 'marker',
                                                html: `<div><svg><circle class="marker__item" cx="5" cy="5" r="5" data-org-id="${mapObject.Organization.OrganizationID}" data-map-id="${mapObject.MapObject.MapObjectID}"/></svg></div>`,
                                                iconSize: [16, 16]
                                            }),
                                            title: mapObject.Organization.Name,
                                            iconSize: [16, 16],
                                            zIndexOffset: 10
                                        });
                                        marker._organization = mapObject.Organization;
                                        marker._mapObject = mapObject.MapObject;
                                        break;

                                }
                                if (marker)
                                    $scope.mapFloors[mapObject.MapObject.FloorID].layerGroup.addLayer(marker);

                                // if (mapObject.MapObject.Params && mapObject.MapObject.Params.SignPointRadius) {
                                //     var markerText = L.Marker.zoomingMarker(mapObject.MapObject);
                                //     markerText.on("click", function (e) {
                                //         $rootScope.currentOrganization = item;
                                //         clickToOrganization(item.OrganizationID);
                                //     });
                                //     if ($scope.mapFloors[mapObject.MapObject.FloorID])
                                //         $scope.mapFloors[mapObject.MapObject.FloorID].layerGroup.addLayer(markerText);
                                // }
                                // else {
                                //     var position = map.convertPosition(mapObject.MapObject); //map.unproject([mapObject.MapObject.Longitude, mapObject.MapObject.Latitude], map.getMaxZoom());
                                //     let markerIcon = getIcon(mapObject.Organization, false, mapObject.MapObject.MapObjectID);
                                //     let marker = L.marker(position, {
                                //         icon: markerIcon,
                                //         title: item.Name,
                                //         iconSize: [16, 16],
                                //         zIndexOffset: getZIndex(item)
                                //     });
                                //     if (mapObject.MapObject.FloorID && $scope.mapFloors[mapObject.MapObject.FloorID]) {
                                //         $scope.mapFloors[mapObject.MapObject.FloorID].layerGroup.addLayer(marker, {pane: 'tilePane'});
                                //         if (!$scope.mapFloors[mapObject.MapObject.FloorID].floorMapObjects[item.OrganizationID])
                                //             $scope.mapFloors[mapObject.MapObject.FloorID].floorMapObjects[item.OrganizationID] = [];
                                //
                                //         $scope.mapFloors[mapObject.MapObject.FloorID].floorMapObjects[item.OrganizationID].push({
                                //             position: position,
                                //             mapObjectID: mapObject.MapObject.MapObjectID
                                //         });
                                //     }
                                // }
                                $scope.mapObjects[mapObject.MapObject.MapObjectID] = mapObject.MapObject;
                            });
                        });
                        //$q.all(promises).then(function () {

                        //Чтобы поставить маркер для терминала без отображения терминалов
                        var terminalOrg = $rootScope.currentTerminal;
                        //var position = map.unproject([terminalOrg.Longitude, terminalOrg.Latitude], map.getMaxZoom());
                        //let markerIcon = getIcon($rootScope.currentTerminal, false);
                        terminalOrg.marker = L.marker(map.convertPosition(terminalOrg), {
                            icon: L.divIcon({
                                className: 'marker',
                                html: `<div><img style="width:40px;margin-top: -60px;margin-left: -10px;" src="Content/images/youHere.png"/></div>`,
                                iconSize: [16, 16]
                            }),
                            title: terminalOrg.Name,
                            iconSize: [16, 16],
                            zIndexOffset: getZIndex($rootScope.currentTerminal)
                        });
                        $scope.mapFloors[terminalOrg.FloorID].layerGroup.addLayer(terminalOrg.marker, {pane: 'tilePane'});
                        $scope.mapOrganizations[terminalOrg.OrganizationID] = terminalOrg;

                        //Наносим организации
                        $scope.options.zoom = map.getZoom();

                        //Устанавливаем терминал
                        $scope.setFloor($rootScope.currentTerminal.FloorID);

                        //init();
                    });
                    $scope.getCount = function (floorID) {
                        return $scope.selectedOrganizations === undefined ? 0 : $linq.Enumerable().From($scope.selectedOrganizations).SelectMany(i => i.MapObjects).Count(i => i.FloorID == floorID);
                    };

                    function getOptimalPath(array) {
                        let paths = {};
                        let mapObject = $rootScope.currentTerminal;//.TerminalMapObject[0].MapObject;
                        //Надписи не учитывем для посторения
                        array = array.filter(i => !i.Params || !i.Params.SignText);
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
                                document.querySelectorAll('[data-org-id="' + $rootScope.currentOrganization.OrganizationID + '"]').forEach(m => {
                                    m.classList.add('_selected');
                                });
                                //mapObjects = $rootScope.currentOrganization.OrganizationMapObject.map(i => i.MapObject);
                                mapObjects = $rootScope.currentOrganization.MapObjects;
                            }
                            // $scope.mapOrganizations[$rootScope.currentOrganization.OrganizationID].marker.setIcon(markerIcon);

                            $scope.selectedOrganizations = [$rootScope.currentOrganization];
                            //Отрисовка бегушего человека
                            //$rootScope.currentPath = $rootScope.mapGraph.findPath($rootScope.currentTerminal.OrganizationTerminal.Longitude, $rootScope.currentTerminal.OrganizationTerminal.Latitude, $rootScope.currentTerminal.Organization.Floor.FloorID, $rootScope.currentOrganization.Longitude, $rootScope.currentOrganization.Latitude, $rootScope.currentOrganization.FloorID);

                            let result = getOptimalPath(mapObjects);
                            //Может быть клик на надпись, но нет входа
                            if (!result) {
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
                    var _currentOrganizations = $rootScope.$watch('currentOrganizations', selectOrganizations);

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
                                //currentLine.push(map.unproject([path.x, path.y], maxZoom));
                                currentLine.push(new L.latLng(path.y, path.x));

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
                    $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
                        if (toState.name.endsWith('.searchResult')) {
                            // $rootScope.currentOrganizations = undefined;
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