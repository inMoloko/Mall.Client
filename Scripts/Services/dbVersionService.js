/**
 * Created by Nekrasov on 6/28/2017.
 */
(function () {
    'use strict';
    class DbVersionService {
        constructor($q, $http, settings, authService, dbService) {
            this.$q = $q;
            this.$http = $http;
            this.settings = settings;
            this.authService = authService;
            this.dbService = dbService;
        }

        checkDb() {
            let self = this;
            self.dbService.getData().then(i => {
                if (!i.CreationDate) {
                    console.error('Нет даты создания базы');
                    return;
                }
                self.authService.getToken().then(token => {
                    return self.$http.post(`${self.settings.checkApiUrl}/TerminalService/CheckDbVersion`, {
                        ClientTime: new Date(),
                        CreationDate: i.CreationDate
                    }, {
                        headers: {
                            'Authorization': 'Bearer ' + token,
                            'Content-Type': 'application/json'
                        }
                    });
                }).then(i => {
                    console.info('Информация о версии базы данных успешно обновленна');
                });
            });
        }

    }
    angular
        .module('app')
        .service('dbVersionService', DbVersionService);

    DbVersionService.$inject = ['$q', '$http', 'settings', 'authService', 'dbService'];
})();