(function () {
    "use strict";
    var app = angular.module('app');
    app.config(function(IdleProvider, KeepaliveProvider) {
        // configure Idle settings
        IdleProvider.idle(30); // in seconds
        IdleProvider.timeout(30); // in seconds
        KeepaliveProvider.interval(30); // in seconds
    })
    .run(function(Idle){
        Idle.watch();
    });
})();
