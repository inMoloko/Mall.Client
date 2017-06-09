(function () {
    'use strict';
    var service = function ($rootScope, $http, settings, dbService, $linq) {
        this._$http = $http;
        this._settings = settings;
        this._dbService = dbService;
        this._$linq = $linq;
    };
    service.prototype.get = function () {
        let self = this;
        return this._dbService.getData().then(data => {
            if (!data.SystemSettings.TERMINAL_MENU_ITEMS)
                return [];
            return self._$linq.Enumerable().From(data.SystemSettings.TERMINAL_MENU_ITEMS).Select(i => {
                if (angular.isObject(i.Value))
                    return {
                        type: 'organization',
                        OrganizationID: i.Value.OrganizationID,
                        Name: i.Key
                    };
                else
                    return {
                        type: 'category',
                        CategoryID: i.Value,
                        Name: i.Key
                    };
            }).ToArray();
        });
    };
    service.$inject = ['$rootScope', '$http', 'settings', 'dbService', '$linq'];
    angular.module('app').service('mainMenuService', service);
})();