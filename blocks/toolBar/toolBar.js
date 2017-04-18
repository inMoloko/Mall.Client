(function () {
    "use strict";
    var controller = function ($scope, $http, settings, $state, $rootScope, arrayHelper, $q, Idle) {
        //Обработка простоя
     
        //Работа с темами
        // $rootScope.colorTheme = settings.colorThemes[0];
        // $rootScope.formatTheme = settings.formatThemes[0];
        // $scope.changeTheme = function (themeType) {
        //     if (themeType == 'colorTheme')
        //         $rootScope.colorTheme = arrayHelper.nextItem(settings.colorThemes, $rootScope.colorTheme);
        //     else if (themeType == 'formatTheme')
        //         $rootScope.formatTheme = arrayHelper.nextItem(settings.formatThemes, $rootScope.formatTheme);
        // };

        
     
    };
    controller.$inject = ['$scope', '$http', 'settings', '$state', '$rootScope', 'arrayHelper', '$q', 'Idle'];
    angular.module('app').controller('toolBarController', controller);
})();