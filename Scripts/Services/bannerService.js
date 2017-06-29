/**
 * Created by Nekrasov on 6/9/2017.
 */
(function () {
    'use strict';
    class BannerService {
        constructor($http, $q, settings, dbService, $linq) {
            this.$http = $http;
            this.settings = settings;
            this.dbService = dbService;
            this.$linq = $linq;
        }

        get() {
            let self = this;
            return self.dbService.getData().then(data => data.Banners);
        }

        getAllActual() {
            let self = this;
            let day = new Date().getDay();
            let myDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
            let nameOfDay = myDays[day];
            return self.dbService.getData().then(data => {
                //moment(i.DateBegin).isBefore()) && (moment(i.DateEnd).isAfter()
                return self.$linq.Enumerable()
                    .From(data.Banners)
                    .Where(i => self.$linq
                        .Enumerable()
                        .From(i.BannerSchedules).Any(j => moment(j.DateFrom).isBefore() && moment(j.DateTo).isAfter() && j[nameOfDay] === true)).ToArray();
            });
        }

    }
    angular
        .module('app')
        .service('bannerService', BannerService);

    BannerService.$inject = ['$http', '$q', 'settings', 'dbService', '$linq'];
})();