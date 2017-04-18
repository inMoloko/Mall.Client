(function () {
    "use strict";
    angular.module('app').directive("keyboard", ['$timeout', 'settings', function ($timeout, settings) {
        return {
            restrict: 'A',
            link: function (scope, element, attributes, ctrl) {
                function refresh (time = 400){
                    if (scope.timeout) {
                        $timeout.cancel(scope.timeout);
                    }
                    scope.timeout = $timeout(function () {
                        jsKeyboard.hide();
                    }, time);
                };
                if (settings.displayKeyboard === false)
                    return;
                var jElement = $(element);
                var event = function () {
                    jsKeyboard.currentElement = jElement;
                    jsKeyboard.currentElementCursorPosition = jElement.val().length || 0;
                    jsKeyboard.show();
                }
                var timeout;
                jElement.on('focusin', function () {
                    jsKeyboard.show();
                });
                jElement.on('focusout', function () {
                    refresh();
                });
                jElement.on('focus, click', event);
                jElement.on('show', function () {
                    refresh(5000);
                });

                jElement.on('writeKeyboard', function(){
                     refresh(5000);
                });
                scope.$on("$destroy", function () {
                    jElement.unbind();
                    // if (scope.timeout) {
                    //     $timeout.cancel(scope.timeout);
                    //     delete scope.timeout;
                    // }
                });
            }
        }
    }]);
})();