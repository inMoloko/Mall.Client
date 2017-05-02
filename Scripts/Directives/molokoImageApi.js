(function () {
    "use strict";
    angular.module('app').directive("molokoImageApi", ['settings', '$parse', '$rootScope', function (settings, $parse, $rootScope) {
        return {
            restrict: 'A',
            scope: {
                model: '=molokoImageApi'
            },
            link: function (scope, element, attributes, ctrl) {
                //var e1 = element.val();
                let watch = scope.$watch('model', function () {
                    if (attributes.url && scope.model) {
                        element.attr("src", settings.webApiBaseUrl + attributes.url.replace(':id', scope.model));
                    }
                });
                element.bind('error', function (error) {
                    element.attr('src', 'data:image/jpeg;base64,' + $rootScope.customer.Logo);
                    element.unbind('error');
                });
                scope.$on("$destroy", function () {
                    watch();
                    element.unbind();
                })
                // element.bind('load', function (result) {
                //     watch();
                //     element.bind();
                // });
            }
        };
    }]);
})();