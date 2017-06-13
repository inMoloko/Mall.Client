(function () {
    "use strict";
    // var controller = function ($scope, $http, settings, $state, $rootScope, $stateParams, eventService) {
    //     this.$http = $http;
    //     this.settings = settings;
    //     this.$stateParams = $stateParams;
    //     this.$rootScope = $rootScope;
    //     this.$scope = $scope;
    //     this.$state = $state;
    //     $rootScope.selectPageName = "АФИША и НОВОСТИ";
    //     var init = function () {
    //         if ($rootScope.events.length !== 0) {
    //             if ($state.current.name === 'events.searchResult')
    //                 $state.go("events.searchResult.event", {EventID: $rootScope.events[0].EventID});
    //             $scope.selectedEventID = $rootScope.events[0].EventID;
    //         }
    //     };
    //
    //     eventService.getFilter().then(events => {
    //
    //         $rootScope.events = events;
    //         init();
    //     });
    //
    //     // if ($rootScope.events === undefined) {
    //     //     let event = $rootScope.$on('floorLoad', function () {
    //     //         init();
    //     //         event();
    //     //     });
    //     // }
    //     // else {
    //     //    init();
    //     // }
    //
    //     imagesLoaded('.wrapper', {background: true}, function () {
    //         setTimeout($rootScope.initMasonry, 250);
    //     });
    //
    //     $scope.select = function (eventID) {
    //         $scope.selectedEventID = eventID;
    //     }
    //
    // };
    class EventListController {
        constructor($state, $rootScope, $stateParams, eventService) {
            let self = this;
            this.$stateParams = $stateParams;
            this.$rootScope = $rootScope;
            this.$state = $state;
            $rootScope.selectPageName = "АФИША и НОВОСТИ";

            imagesLoaded('.wrapper', {background: true}, function () {
                setTimeout($rootScope.initMasonry, 250);
            });

            eventService.getFilter().then(events => {

                $rootScope.events = events;
                if ($rootScope.events.length !== 0) {
                    if ($state.current.name === 'events.searchResult')
                        $state.go("events.searchResult.event", {EventID: $rootScope.events[0].EventID});
                    self.selectedEventID = $rootScope.events[0].EventID;
                }
            });
        }

        select(eventID) {
            this.selectedEventID = eventID;
        }
    }

    EventListController.$inject = ['$state', '$rootScope', '$stateParams', 'eventService'];
    angular.module('app').controller('eventListController', EventListController);
})();