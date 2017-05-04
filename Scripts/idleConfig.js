(function () {
    "use strict";
    var app = angular.module('app');
    app.config(function (IdleProvider, KeepaliveProvider, TitleProvider) {
        // configure Idle settings
        IdleProvider.idle(30); // in seconds
        IdleProvider.timeout(30); // in seconds
        KeepaliveProvider.interval(30); // in seconds
        TitleProvider.enabled(false);
    })
        .run(function (Idle) {
            Idle.watch();
        });
})();
