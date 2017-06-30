/**
 * Created by Nekrasov on 6/28/2017.
 */
(function () {
    'use strict';
    class DbVersionService {
        constructor($q, $http, settings, $linq, dbService) {
            this.$q = $q;
            this.$http = $http;
            this.settings = settings;
            this.$linq = $linq;
            this.dbService = dbService;
        }

        getToken(password) {
            let self = this;
            return self.$http({
                method: 'POST',
                url: self.settings.authUrl + `/Token`,
                headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                data: `grant_type=password&username=${self.settings.serialNumber}&password=${password}`
            }).then(response => response.data.access_token);
        }

        checkDb() {
            let self = this;
            self.dbService.getData().then(i => {
                if (!i.CreationDate) {
                    console.error('Нет даты создания базы');
                    return;
                }
                let floor = i.Floors.find(j=>j.TerminalMapObject);
                if(!floor || !floor.TerminalMapObject.Token)
                {
                    console.error('Нет терминала или в базе отсутствует токен');
                    return;
                }
                self.getToken(floor.TerminalMapObject.Token).then(token => {
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

    DbVersionService.$inject = ['$q', '$http', 'settings', '$linq', 'dbService'];
})();