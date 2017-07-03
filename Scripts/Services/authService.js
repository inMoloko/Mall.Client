/**
 * Created by Nekrasov on 6/30/2017.
 */
(function () {
    class AuthService {
        constructor($q, $http, settings, $linq, dbService) {
            this.$q = $q;
            this.$http = $http;
            this.settings = settings;
            this.$linq = $linq;
            this.dbService = dbService;
        }

        getToken() {
            let self = this;
            if (self.settings.token) {
                return self.$http({
                    method: 'POST',
                    url: self.settings.authUrl + `/Token`,
                    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                    data: `grant_type=password&username=${self.settings.serialNumber}&password=${encodeURIComponent(self.settings.token)}`
                    //data: `grant_type=password&username=${self.settings.serialNumber}&password=${self.settings.token.replace(/\+/g,"%2B")}`
                }).then(response => response.data.access_token);
            }
            else {
                return self.dbService.getData().then(i => {
                    let floor = i.Floors.find(j => j.TerminalMapObject);
                    if (!floor || !floor.TerminalMapObject.Token) {
                        console.error('Нет терминала или в базе отсутствует токен');
                        return;
                    }
                    self.settings.token = floor.TerminalMapObject.Token;

                    return self.$http({
                        method: 'POST',
                        url: self.settings.authUrl + `/Token`,
                        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                        data: `grant_type=password&username=${encodeURIComponent(self.settings.serialNumber)}&password=${encodeURIComponent(self.settings.token)}`
                    }).then(response => response.data.access_token);
                });
            }
        }
    }

    AuthService.$inject = ['$q', '$http', 'settings', '$linq', 'dbService'];
    angular.module('app').service('authService', AuthService);
})();