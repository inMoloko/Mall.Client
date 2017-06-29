(function () {
    "use strict";
    var controller = function ($scope, $http, $interval, settings, $rootScope, $state, $stateParams, Idle, $timeout) {
        var currentSlide = 0;
        var carouser;

        $rootScope.$watch('banners', function () {
            if ($rootScope.banners !== undefined)
               $scope.banners = $rootScope.banners;
                // if ($rootScope.orientation == 'vertical')
                //     $scope.banners = $rootScope.verticalBanners;
                // else
                //     $scope.banners = $rootScope.horizontalBanners;

            $scope.start();
        });

        // $scope.getBanners = function () {
        //     return $rootScope.orientation == 'vertical' ? $scope.banners = $rootScope.verticalBanners : $scope.banners = $rootScope.horizontalBanners;
        // };
        $scope.closeScreenSaver = function () {            
            $rootScope.addStatistics('CloseScreenSaver', '');
            $state.go("navigation.mainMenu");
            Idle.watch();
        };

        $scope.nextSlide = function () {
            $scope.slides = document.querySelectorAll('#slides .slide');
            if ($scope.slides != undefined && $scope.slides.length != 0) {
                $scope.slides[currentSlide].className = 'slide';
                currentSlide = (currentSlide + 1) % $scope.slides.length;
                $scope.slides[currentSlide].className = 'slide showing';
            }
        };
        
        $scope.start = function () {
            $scope.stop();
            $timeout($scope.nextSlide);
            carouser = $interval($scope.nextSlide, 10000);
        };

        $scope.stop = function () {
            $interval.cancel(carouser);
        };

        $scope.$on('$destroy', function () {
            $scope.stop();
        });


    };
    controller.$inject = ['$scope', '$http', '$interval', 'settings', '$rootScope', '$state', '$stateParams', 'Idle', '$timeout'];
    angular.module('app').controller('screensaverController', controller);
})();