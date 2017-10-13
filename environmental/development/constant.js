(function () {
    "use strict";
    var app = angular.module('app');
    var queryDict = {};
    location.search.substr(1).split("&").forEach(function (item) { queryDict[item.split("=")[0]] = decodeURIComponent(item.split("=")[1]) });
    if(!queryDict.SerialNumber){
        console.error('Не указан серийный номер');
    }
    app.constant('settings', {
        webApiBaseUrl: 'http://localhost:51147/api',
        authUrl: 'http://localhost:51147',
        checkApiUrl:'http://localhost:51147/api',
        defaultPage: '/Monitoring',
        //Доступные темы. Первая тема принимается темой по умолчанию
        colorThemes: ['colorTheme_color', 'colorTheme_blackLite'],
        //formatThemes: ['formatTheme_horizontal', 'formatTheme_horizontalSmall'],
        formatThemes: ['formatTheme_vertical', 'formatTheme_verticalSmall', 'formatTheme_horizontal', 'formatTheme_horizontalSmall'],
        //Скорость человечка
        manVelocity: 30,
        //Дельта смещения точки прикосновения. Если смещение меньше дельты - срабатывает событие клик
        deltaDistanceTouchMoveAsClick: 100,
        customerID: queryDict.CustomerID,
        terminalID: queryDict.TerminalID,
        serialNumber:queryDict.SerialNumber,
        token:queryDict.Token,
        displayKeyboard:true,
        autoReset:true,
        resourceFolder:'Content/Backup',
        dbPath: `Content/Backup/db/${queryDict.SerialNumber}.json`,
        //dbPath: `http://mproduction:9999/api/Backup/Get?TerminalID=${queryDict.TerminalID}`,
    });
})();
