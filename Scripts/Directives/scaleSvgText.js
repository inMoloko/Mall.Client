(function () {
    "use strict";
    angular.module('app').directive("scaleSvgText", ['settings', function (settings) {
        return {
            restrict: 'E',
            templateUrl: './Views/scaleSvgText.html',
            replace: true,
            scope: {
                model: '=ngModel'
            },
            link: function (scope, element, attributes, ctrl) {
                scope.$watch('model', function () {
                    scope.width = attributes.width;
                    scope.height = attributes.height;
                    var elm = element[0].children[0]

                    var bb = elm.getClientRects()[0];
                    var widthTransform = width / bb.width;
                    var heightTransform = height / bb.height;
                    var value = widthTransform < heightTransform ? widthTransform : heightTransform;
                    scope.transform = "matrix(" + value + ", 0, 0, " + value + ", 0,0)";

                });
            }
        }
    }]);
})();