(function () {
    "use strict";
    class EventController {
        constructor($rootScope, $stateParams, eventService) {
            let self = this;
            this.$stateParams = $stateParams;
            this.$rootScope = $rootScope;
            $rootScope.selectPageName = "АФИША и НОВОСТИ";
            eventService.get($stateParams.EventID).then(i => {
                self.item = i;
            });
        }

    }

    EventController.$inject = ['$rootScope', '$stateParams', 'eventService'];
    angular.module('app').controller('eventController', EventController);
})();