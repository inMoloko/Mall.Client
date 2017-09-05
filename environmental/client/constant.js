(function () {
    "use strict";
    var app = angular.module('app');
    var queryDict = {};
    location.search.substr(1).split("&").forEach(function (item) { queryDict[item.split("=")[0]] = decodeURIComponent(item.split("=")[1]) });

    if(!queryDict.SerialNumber){
        console.error('Не указан серийный номер');
    }
    app.constant('settings', {
        checkApiUrl:'http://lk.inmoloko.ru/api',
        webApiBaseUrl: 'http://lk.inmoloko.ru/api',
        authUrl: 'http://lk.inmoloko.ru',
        webApiODataUrl: 'http://localhost:5555/odata',
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
        resourceFolder: 'C:/MOLOKO.Content',//'C:/MOLOKO.Sync/1/Resources',
        dbPath: `C:/MOLOKO.Content/db/${queryDict.SerialNumber}.json`,
    });
})();
