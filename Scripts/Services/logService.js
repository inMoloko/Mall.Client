/**
 * Created by Nekrasov on 6/28/2017.
 */
(function () {
    'use strict';
    class LogService {
        constructor() {

        }
        error(message){
            let fso = new FSO(1024 * 1024, false, suc => {
                console.log(suc);
                }, err => {
                console.log(err);
            });
            let fsq = fso.createQueue();
            fsq.mkdir('Client.Logs');
            fsq.write(`Client.Logs/${moment().format('YYYYDDMM')}.txt`, message);
            fsq.read(`Client.Logs/${moment().format('YYYYDDMM')}.txt`, function(data) { console.log(data); });
            fsq.execute(suc => {
                console.log(suc);
            }, err => {
                console.log(err);
            });

        }
    }
    LogService.$inject = [];
    angular
        .module('app')
        .service('logService', LogService);
})();