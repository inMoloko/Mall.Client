(function () {
    "use strict";
    var controller = function ($scope, $http, settings, $state, $rootScope, arrayHelper, $q, Idle, $location, $stateParams, $timeout, dbService, $linq, bannerService, dbVersionService, logService, statisticService) {
        //Обработка простоя
        $scope.$on('IdleTimeout', function () {
            $rootScope.colorTheme = settings.colorThemes[0];
            $rootScope.formatTheme = $scope.formatThemesMain[0];

            //if ($rootScope.statisticStack && $rootScope.statisticStack.length > 0)
            $rootScope.sendStatistics();
            //$state.go('navigation.mainMenu', {});
            // console.log('send');
            // Idle.watch();
            // //TODO
            if (settings.autoReset === false)
                return;
            $("input, textarea").focusout();
            if ($rootScope.banners.length > 0)
                $state.go('screensaver', {});
            else {
                $state.go('navigation.mainMenu', {});
                Idle.watch();
            }
            // $timeout(function () {
            //     location.reload();
            // });
        });

        $scope.formatThemesMain = [];
        $rootScope.orientation;
        $scope.changeOrientation = function () {
            if (window.innerHeight > window.innerWidth) {
                $scope.formatThemesMain = settings.formatThemes.filter(e => e.includes('vertical'));
                $rootScope.orientation = 'vertical';
            }
            else {
                $scope.formatThemesMain = settings.formatThemes.filter(e => e.includes('horizontal'));
                $rootScope.orientation = 'horizontal';
            }
            $rootScope.formatTheme = $scope.formatThemesMain[0];
        };

        $(window).resize(function () {
            $scope.changeOrientation();
            $state.reload();
        });

        //Работа с темами
        $rootScope.colorTheme = settings.colorThemes[0];
        $rootScope.formatTheme = settings.formatThemes[0];
        $scope.changeTheme = function (themeType) {
            if (themeType == 'colorTheme')
                $rootScope.colorTheme = arrayHelper.nextItem(settings.colorThemes, $rootScope.colorTheme);
            else if (themeType == 'formatTheme')
                $rootScope.formatTheme = arrayHelper.nextItem($scope.formatThemesMain, $rootScope.formatTheme);
            setTimeout($rootScope.initMasonry, 250);
        };

        $rootScope.initMasonry = function () {
            $(".wrapper").masonry({
                itemSelector: ".item ",
                columnWidth: ".item"
            });
        };
        $scope.changeOrientation();
        //граф для поиска организаций
        $rootScope.mapGraph = new Graph();

        $scope.change = function () {
            $state.go('navigation.mainMenu', {});
        };

        $rootScope.addStatistics = function (action, parametr) {
            var statItem = {
                Action: action,
                ParamsAsJson: parametr,
                Date: new Date()//(new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000)).toISOString().slice(0, -1)
            };
            statisticService.addStatistic(statItem);

            // if (!$rootScope.statisticStack)
            //     $rootScope.statisticStack = [];
            // $rootScope.statisticStack.push(statItem);
        };
        let locationChangeHandler = $rootScope.$on('$locationChangeSuccess', function () {
            if ($state.current.name === 'navigation.searchResult.organization' ||
                $state.current.name === 'navigation.organization' ||
                $state.current.name === 'navigation.mainMenu.organization' ||
                $state.current.name === 'navigation.closedResult.organization') {
                $rootScope.addStatistics('SelectОрганизацияСхема', {
                    OrganizationID: +$rootScope.currentOrganization.OrganizationID,
                    CategoryID: +$rootScope.currentCategory ? $rootScope.currentCategory.CategoryID : null,
                    Filter: $rootScope.currentFilter
                });
            } else
                $rootScope.addStatistics('Command', {url: $location.url()});

        });
        $rootScope.sendStatistics = function () {
            // if(settings.preventStatistic === true)
            //     return;
            statisticService.sendStatistics();
            //Возможно ParamsAsJson объект, тогда его нужно преобразовать в строку
            // $rootScope.statisticStack.forEach(i => {
            //     if (angular.isObject(i.ParamsAsJson))
            //         i.ParamsAsJson = angular.toJson(i.ParamsAsJson);
            // });
            //
            // $http({
            //     method: 'POST',
            //     url: settings.webApiBaseUrl + '/Statistic',
            //     data: JSON.stringify($rootScope.statisticStack),
            //     headers: {'Content-type': 'application/json'}
            // }).then(function (response) {
            //     $rootScope.statisticStack = undefined;
            // }, function (response) {
            //     //$rootScope.addStatistics('SendStatistics', '{"Param":"Not sended"}');
            //     console.error("При отправке статистики произошла ошибка");
            // });
        };
        //     $rootScope.systemSettings = response[8].data;
        //     if ($rootScope.systemSettings && $rootScope.systemSettings.length) {
        //         let result = $rootScope.systemSettings.find(i => i.SettingType == "TERMINAL_MENU_ITEMS");
        //         if (result && result.Histories[0]) {
        //             let value = angular.fromJson(result.Histories[0].SettingValue);
        //             $rootScope.menuItems = {};
        //             //Структура меню {"Название категории": id}
        //             //или {"Название организации": {OrganizationID:id}}
        //             let idx = 1;
        //             angular.forEach(value, function (i, j) {
        //                 if (angular.isObject(i))
        //                     $rootScope.menuItems[idx] = {
        //                         Name: j,
        //                         OrganizationID: i.OrganizationID,
        //                         type: 'organization'
        //                     };
        //                 else
        //                     $rootScope.menuItems[idx] = {Name: j, CategoryID: i, type: 'category'};
        //                 idx++;
        //             });
        //
        //         }
        //         result = $rootScope.systemSettings.find(i => i.SettingType == "TERMINAL_SERVICE_CATEGORIES");
        //         if (result && result.Histories[0]) {
        //             $rootScope.serviceCategories = angular.fromJson(result.Histories[0].SettingValue);
        //         }
        //         result = $rootScope.systemSettings.find(i => i.SettingType == "TERMINAL_CINEMA_ID");
        //         if (result && result.Histories[0]) {
        //             $rootScope.cinemaID = angular.fromJson(result.Histories[0].SettingValue);
        //         }
        //     }
        //     $rootScope.customer = response[9].data[0];
        //
        //     document.title = 'Навигация по '+ $rootScope.customer.Name;
        //
        //     let dat = new Date().getDay() - 1;
        //     if (dat < 0)
        //         dat = 6;
        //     $rootScope.customer.ScheduleFrom = JSON.parse($rootScope.customer.Schedule)[dat].From;
        //     $rootScope.customer.ScheduleTo = JSON.parse($rootScope.customer.Schedule)[dat].To;
        //     //$rootScope.menuItems = { "1965": { Name: 'Магазины', CategoryID: 1965 }, "1966": { Name: 'Рестораны и кафе', CategoryID: 1966 }, "1967": { Name: "Развлечения и услуги", CategoryID: 1967 } };
        //
        //     $rootScope.proposals = response[10].data;
        //
        //     //$rootScope.cinemaTimetable = response[11].data;
        // });
        let graphLayerd = {};
        $rootScope.floorsDic = {};
        dbService.getData().then(data => {

            data.Floors.forEach(function (floor, i, arr) {
                let layer = graphLayerd[floor.FloorID] = $rootScope.mapGraph.addLayer(floor.FloorID);
                floor.Paths.forEach(p => {
                    let x1 = p[0].X;
                    let y1 = p[0].Y;
                    let x2 = p[1].X;
                    let y2 = p[1].Y;
                    //layer.addSegment(p[0].x, p[0].y, p[1].x, p[1].y);
                    layer.addSegment(x1, y1, x2, y2);
                    $rootScope.floorsDic[floor.FloorID] = floor;
                });
                if (floor.TerminalMapObject)
                    graphLayerd[floor.FloorID].addVertexWithShortestSegment(floor.TerminalMapObject.Longitude, floor.TerminalMapObject.Latitude);
            });
            data.Links.forEach(link => {
                var layer1 = graphLayerd[link.MapObjectFrom.FloorID];
                let x = link.MapObjectFrom.Longitude;
                let y = link.MapObjectFrom.Latitude;
                let vertex1 = layer1.getVertex(x, y) || layer1.addVertexWithShortestSegment(x, y).vertex;

                let layer2 = graphLayerd[link.MapObjectTo.FloorID];
                x = link.MapObjectTo.Longitude;
                y = link.MapObjectTo.Latitude;

                let vertex2 = layer2.getVertex(x, y) || layer2.addVertexWithShortestSegment(x, y).vertex;
                if (vertex1 && vertex2) {
                    let segment1 = layer1.addSegment1(vertex1, vertex2);
                    layer2.addSegment1(vertex1, vertex2);
                }
            });
            $rootScope.anchorOrganizations = $linq.Enumerable().From(data.Organizations).Select(i => i.Value).Where(o => o.IsAnchor == 1 && o.Schedule != null).ToArray();
            $rootScope.anchorOrganizations.forEach(i => {
                try {
                    var schedule = JSON.parse(i.Schedule);

                    var listPeriod = [];
                    schedule.forEach(s => {
                        if (s.isUse != true) {
                            var period = {};
                            period.fromTime = s.From;
                            period.toTime = s.To;
                            period.listDays = [];
                            schedule.forEach(ss => {
                                if (ss.From == s.From && ss.To == s.To) {
                                    period.listDays.push({num: schedule.indexOf(ss), day: ss.Name});
                                    ss.isUse = true;
                                }
                            });
                            listPeriod.push(period);
                        }
                    });

                    listPeriod.sort(function (a, b) {
                        return b.listDays.length > 3;
                    });
                    i.displaySchedule = [];
                    listPeriod.forEach(lp => {
                        i.displaySchedule.push($scope.getDisplaySchedule(lp));
                    });
                }
                catch (exc) {
                    console.error('Ошибка формирования расписания');
                }
            });
            $rootScope.anchorOrganizations = $rootScope.anchorOrganizations.filter(a => a.displaySchedule != undefined);
        });
        bannerService.getAllActual().then(banners => {

            $rootScope.banners = banners;
            $rootScope.horizontalBanners = banners;
        });


        $rootScope.$watchCollection('currentOrganizations', function () {
            if ($rootScope.currentOrganizations === undefined && $rootScope.currentOrganization === undefined) {
                if ($state.current.name !== "navigation.mainMenu")
                    $state.go('navigation.mainMenu');
                return;
            }
            //if ($state.current.name !== "navigation.searchResult")
            //    $state.go('navigation.searchResult');
        });
        $rootScope.$watch('currentOrganization', function (nw, old) {
            if ($rootScope.currentOrganization !== undefined && nw != old) {
                //if ($state.current.name !== "navigation.searchResult.organization")
                //$state.go('navigation.searchResult.organization', { OrganizationID: $rootScope.currentOrganization ? $rootScope.currentOrganization.OrganizationID : null });
            }

        });
        $rootScope.$on('$stateChangeSuccess',
            function (event, toState, toParams, fromState, fromParams) {
                //console.log(fromState, toState);
                //Начальное состояние ничего не выбранно
                if (toState.name === 'navigation.mainMenu') {
                    $rootScope.currentOrganizations = undefined;
                    $rootScope.currentOrganization = undefined;
                }
            });
        $rootScope.$on('$stateChangeError', function (event, toState, toParams, fromState, fromParams) {
            console.log('');
        });

        $rootScope.scrollConfig = {
            autoHideScrollbar: false,
            theme: 'minimal-dark',
            axis: 'y',
            advanced: {
                updateOnContentResize: true
            },
            setHeight: false,
            scrollInertia: 0
        }
        $rootScope.$watch('formatTheme', function (n, o) {
            console.log('Change theme', n, o);
        });

        var x, y;

        function init() {
            preventLongPressMenu(document);
        }


        //время работы якорей
        $rootScope.anchorOrganizations;

        $scope.showAnchorOrganization = function (item) {
            $state.go('navigation.organization', {
                OrganizationID: item.OrganizationID,
                Filter: $stateParams.Filter,
                CategoryID: $stateParams.CategoryID
            }, {inherit: true});
        };

        $scope.getDisplaySchedule = function (schedule) {
            var days = "";
            switch (schedule.listDays.length) {
                case 1:
                    return schedule.listDays[0].day + " - " + $scope.getDisplayWorkTime(schedule);
                case 2:
                    return schedule.listDays[0].day + " и " + schedule.listDays[1].day + " - " + $scope.getDisplayWorkTime(schedule);
                case 3: {
                    if (Math.abs(schedule.listDays[0].num - schedule.listDays[1].num) == 1 && Math.abs(schedule.listDays[1].num - schedule.listDays[2].num) == 1)
                        return schedule.listDays[0].day + "-" + schedule.listDays[2].day + " " + $scope.getDisplayWorkTime(schedule);
                    else
                        return schedule.listDays[0].day + ", " + schedule.listDays[1].day + ", " + schedule.listDays[2].day + " - " + $scope.getDisplayWorkTime(schedule);
                }
                default:
                    return $scope.getDisplayWorkTime(schedule);
            }
        };

        $scope.getDisplayWorkTime = function (schedule) {
            if (schedule.fromTime.trim() == schedule.toTime.trim())
                return "круглосуточно";
            else
                return "с " + schedule.fromTime.substring(0, 5) + " до " + schedule.toTime.substring(0, 5);
        };

        $rootScope.$watch('organizations', function () {
            if ($rootScope.organizations) {
                $rootScope.anchorOrganizations = $rootScope.organizations.filter(o => o.IsAnchor == 1 && o.Schedule != null);
                $rootScope.anchorOrganizations.forEach(i => {
                    try {
                        var schedule = JSON.parse(i.Schedule);

                        var listPeriod = [];
                        schedule.forEach(s => {
                            if (s.isUse != true) {
                                var period = {};
                                period.fromTime = s.From;
                                period.toTime = s.To;
                                period.listDays = [];
                                schedule.forEach(ss => {
                                    if (ss.From == s.From && ss.To == s.To) {
                                        period.listDays.push({num: schedule.indexOf(ss), day: ss.Name});
                                        ss.isUse = true;
                                    }
                                });
                                listPeriod.push(period);
                            }
                        });

                        listPeriod.sort(function (a, b) {
                            return b.listDays.length > 3;
                        });
                        i.displaySchedule = [];
                        listPeriod.forEach(lp => {
                            i.displaySchedule.push($scope.getDisplaySchedule(lp));
                        });
                    }
                    catch (exc) {
                        return;
                    }
                });
                $rootScope.anchorOrganizations = $rootScope.anchorOrganizations.filter(a => a.displaySchedule != undefined);
            }
        });
        dbVersionService.checkDb();
    };
    controller.$inject = ['$scope', '$http', 'settings', '$state', '$rootScope', 'arrayHelper', '$q', 'Idle', '$location', '$stateParams', '$timeout', 'dbService', '$linq', 'bannerService', 'dbVersionService', 'logService', 'statisticService'];
    angular.module('app').controller('mainController', controller);
})();