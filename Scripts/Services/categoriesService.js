/**
 * Created by Nekrasov on 04.04.2017.
 */
(function () {
    'use strict';
    class CategoryService {
        constructor($http, $q, settings, dbService, $linq) {
            this.$http = $http;
            this.settings = settings;
            this.dbService = dbService;
            this.$linq = $linq;
        }

        get() {
            let self = this;
            return self.dbService.getData().then(data => self.$linq.Enumerable().From(data.Categories).Select(i => {
                let cat = i.Value;
                if (cat.ChildIds) {
                    cat.Children = cat.ChildIds.filter(j=>j!== cat.CategoryID).map(j => data.Categories[j]);
                }
                return cat;
            }).ToArray());
        }

        getById(categoryID) {
            let self = this;
            return self.dbService.getData().then(data => {
                return data.Categories[categoryID];
            });
        }

        getFilterCategories(categoryID) {
            //return this.$http.get(this.settings.webApiBaseUrl + '/Category/GetFilterCategories?CategoryID=' + categoryID, {cache: true}).then(i => i.data);
            let self = this;
            return self.dbService.getData().then(data => {
                return self.$linq.Enumerable().From(data.Categories[categoryID].ChildIds).Select(i => data.Categories[i]).OrderBy(i => i.Name).ToArray();

            });
        }

        getAllRecursive() {
            return this.$http.get(this.settings.webApiBaseUrl + '/Category/GetAllRecursive?CustomerID=' + this.settings.customerID, {cache: true}).then(i => i.data);
        }
    }
    angular
        .module('app')
        .service('categoryService', CategoryService);

    CategoryService.$inject = ['$http', '$q', 'settings', 'dbService', '$linq'];
})();