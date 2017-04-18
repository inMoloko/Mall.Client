(function () {
    "use strict";
    var controller = function ($scope, $http, settings, $rootScope, $state, $stateParams, $timeout) {
        //Загружаем категории

        $scope.config = {
            autoHideScrollbar: false,
            theme: 'minimal-dark',
            axis: 'y',
            advanced: {
                updateOnContentResize: true
            },
            setHeight: false,
            scrollInertia: 0,
            autoDraggerLength: false

        }
        $scope.home = function () {
            $rootScope.$broadcast("resetMap");
            $state.go("navigation.mainMenu");
        };

        // $(function () {
        //     jsKeyboard.init("virtualKeyboard");
        // });

        //'writeKeyboard'
        //$('#searchInputBlock').on('writeKeyboard', function (event, a) {
        //    $timeout(function () {
        //        $scope.currentFilter = $('#searchInputBlock')[0].value
        //        $state.go('navigation.searchResult', { CategoryID: $rootScope.currentCategory ? $rootScope.currentCategory.CategoryID : undefined, Filter: $rootScope.currentFilter }, { reload: false, });
        //    }, 100);

        $('#searchInputBlock').bind('writeKeyboard', function (event, a) {            
            $rootScope.currentFilter = $('#searchInputBlock')[0].value;            
            //$state.go('navigation.searchResult', { CategoryID: $rootScope.currentCategory ? $rootScope.currentCategory.CategoryID : undefined, Filter: $rootScope.currentFilter }, { reload: false, });
            $scope.$apply();
        });
               
        $scope.find = function (category, name) {
            $rootScope.currentOrganization = undefined;
            $state.go('navigation.searchResult', { CategoryID: category ? category.CategoryID : null, Filter: name });
        };
        $scope.levelLimit = function () {
            if ($rootScope.categories !== undefined) {
                return $rootScope.categories.filter(i => i.Level == 0 || i.Level == 1);
            }
        };
        $scope.changeCategory = function (category, name) {
            //Чтобы избаваиться от задержки при схлапывании списка категорий при выборе категории
            $timeout(function () {
                $rootScope.currentCategory = category;
            $rootScope.currentOrganization = undefined;
            //TODO Зачемто сброс фильтра при установке категорий == пункт меню
            // if ($rootScope.menuItems[category.CategoryID]) {
            //     $rootScope.currentFilter = undefined;
            // };
            if ($state.$current.name == "searchResultFull.result")
                $state.go('searchResultFull.result', { CategoryID: category.CategoryID, Filter: $rootScope.currentFilter }, { reload: false });
            else
                $state.go('navigation.searchResult', { CategoryID: category.CategoryID, Filter: $rootScope.currentFilter }, { reload: false });

            }, 10);

            
        };

        $scope.$watch("currentFilter", function (n, o) {
            if (n == o)
                return;
            if ($state.current.name == "navigation.mainMenu" && $rootScope.currentFilter == undefined)
                return;
            $rootScope.currentOrganization = undefined;
            if ($state.$current.name == "searchResultFull.result")
                $state.go('searchResultFull.result', { CategoryID: $rootScope.currentCategory ? $rootScope.currentCategory.CategoryID : undefined, Filter: $rootScope.currentFilter }, {
                    reload: false,
                });
            else
                $state.go('navigation.searchResult', { CategoryID: $rootScope.currentCategory ? $rootScope.currentCategory.CategoryID : undefined, Filter: $rootScope.currentFilter }, {
                    reload: false,
                });
            // $state.transitionTo('navigation.searchResult', { CategoryID: $scope.currentCategory ? $scope.currentCategory.CategoryID : undefined, Filter: $scope.currentFilter }, {
            //     location: true,
            //     inherit: true,
            //     notify: true
            // })
        });
        let changeStatehandler = $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
            //Начальное состояние ничего не выбранно
            if (toState.name === 'navigation.mainMenu') {
                $rootScope.currentFilter = undefined;
                $rootScope.currentCategory = { CategoryID: -1 };
            };
            $rootScope.currentFilter = $stateParams.Filter;
            $rootScope.currentCategory = $rootScope.categoriesDic[$stateParams.CategoryID || -1];
        });
        //Установка при загрузке
        $rootScope.currentFilter = $stateParams.Filter;
        if ($rootScope.categoriesDic === undefined) {
            let event = $rootScope.$on('floorLoad', function () {
                $rootScope.currentCategory = $rootScope.categoriesDic[$stateParams.CategoryID || -1];
                event();
            });
        }
        else
            $rootScope.currentCategory = $rootScope.categoriesDic[$stateParams.CategoryID || -1];

        $scope.$on('$destroy', function () {
            changeStatehandler();
        });
    };
    controller.$inject = ['$scope', '$http', 'settings', '$rootScope', '$state', '$stateParams', '$timeout'];
    angular.module('app').controller('searchControlController', controller);
})();