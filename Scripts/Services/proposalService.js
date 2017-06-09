(function () {
    'use strict';
    var service = function ($http, $q, settings, dbService, $linq) {
        this.$http = $http;
        this.$q = $q;
        this.settings = settings;
        this.dbService = dbService;
        this.$linq = $linq;
    };
    service.prototype.get = function (id) {
        // let deferred = this.$q.defer();
        // this.$http.get(this.settings.webApiBaseUrl + `/Proposal/${id}`).then(function (data) {
        //     deferred.resolve(data.data);
        // }, function (err) {
        //     deferred.reject(err);
        // });
        // return deferred.promise;
        let self = this;
        return self.dbService.getData().then(data => {
            return data.Proposals[id];
        });
    };
    service.prototype.getFilter = function (term) {
        let self = this;
        return self.dbService.getData().then(data => {
            let result = self.$linq.Enumerable().From(data.Proposals).Select(i => i.Value);
            let date = new Date();
            result = result.Where(i => (moment(i.DateBegin).isBefore(date)) && (moment(i.DateEnd).isAfter(date)));
            if (term) {
                term = term.toLowerCase();
                result = result.Where(i => (i.Name && i.Name.toLowerCase().includes(term)) || (i.Summary && i.Summary.toLowerCase().includes(term)) || (i.KeyWords && i.KeyWords.toLowerCase().includes(term)))
            }
            return result.OrderBy(i => i.DateEnd).ToArray();
        });
    };
    service.prototype.getDetailFilter = function (filter) {
        let self = this;
        return self.dbService.getData().then(data => {
            return self.$linq.Enumerable().From(data.Proposals)
                .Select(i => i.Value)
                .Where(i => (moment(i.DateBegin).isBefore()) && (moment(i.DateEnd).isAfter()))
                .Where(i => self.$linq.Enumerable().From(i.Organization.Categories).Intersect(filter.Categories).Count() !== 0)
                .OrderBy(i => i.DateEnd).ToArray();
        });
    };
    service.prototype.getByOrganization = function (id) {
        // let deferred = this.$q.defer();
        // let dt = new Date().toISOString();
        // let filter = `OrganizationID eq ${id} and DateEnd ge DateTime'${dt}' and DateBegin le DateTime'${dt}'`;
        // this.$http.get(this.settings.webApiBaseUrl + `/Proposal?$select=ProposalID,DateBegin,DateEnd,Name,Summary&$filter=${filter}`).then(function (data) {
        //     deferred.resolve(data.data);
        // }, function (err) {
        //     deferred.reject(err);
        // });
        // return deferred.promise;
        id = +id;
        let self = this;
        return self.dbService.getData().then(data => {
            let result = self.$linq.Enumerable().From(data.Proposals).Select(i => i.Value);
            let date = new Date();
            result = result.Where(i => (moment(i.DateBegin).isBefore(date)) && (moment(i.DateEnd).isAfter(date))).Where(i => i.Organization.OrganizationID === id);

            return result.OrderBy(i => i.DateEnd).ToArray();
        });
    };
    angular
        .module('app')
        .service('proposalService', service);

    service.$inject = ['$http', '$q', 'settings', 'dbService', '$linq'];
})();