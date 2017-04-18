(function() {
    "use strict";
    var controller = function($scope, $http, settings, $state, $rootScope, $stateParams, $linq) {
        this.$http = $http;
        this.settings = settings;
        this.$stateParams = $stateParams;
        this.$rootScope = $rootScope;
        this.$scope = $scope;
        this.$state = $state;
        this.$linq = $linq;
        this.getCinemaTimetable();
    };
    controller.prototype.getCinemaTimetable = function() {
        let self = this;
        let cinemaTimetable = this.$http.get(this.settings.webApiBaseUrl + `/Movie?$select=Title,Timing,Description,MovieID,Genre,AgeLimit,CinemaTimeTables/Datetime,CinemaTimeTables/Price,CinemaTimeTables/Hall,CinemaTimeTables/Format&$expand=CinemaTimeTables&CustomerID=${this.settings.customerID}`);
        let tommorow = moment().add(1,'d').set({'hour':0,'minute':0,'second':0});
        
        cinemaTimetable.then(function(result) {
            self.$scope.cinemaTimetable = result.data;

            //var reswult = self.$linq.Enumerable().From(self.$scope.cinemaTimetable).SelectMany(i => i.CinemaTimeTables);
            self.$scope.cinemaTimetable.forEach(i => {
                i.group = self.$linq.Enumerable().From(i.CinemaTimeTables).Where(i=>moment(i.Datetime).isBetween(moment(), tommorow)).GroupBy(i => i.Hall, null, (k, g) => { return { Hall: k, Movies: g.source } }).ToArray();
            });
            self.$scope.cinemaTimetable = self.$linq.Enumerable().From(self.$scope.cinemaTimetable).Where(i=>i.group.length !== 0).ToArray();
            console.log(self.$scope.cinemaTimetable);
        });
    };
    controller.$inject = ['$scope', '$http', 'settings', '$state', '$rootScope', '$stateParams', '$linq'];
    angular.module('app').controller('cinemaTimetableController', controller);
})();