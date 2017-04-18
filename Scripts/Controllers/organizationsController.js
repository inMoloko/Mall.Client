(function () {
    "use strict";
    var controller = function ($scope, $http, settings, $rootScope, $stateParams) {

        var filterChangeHandler = $rootScope.$on("filterChange", load);

        function load(event, filter) {
            var url = `${settings.webApiBaseUrl}/CategoryOrganization?$expand=Organization`;
            if (filter !== undefined) {
                var coll = [];
                if (filter.filter) {
                    coll.push(`substringof(tolower('${filter.filter}'),tolower(Organization/Name))`);
                }
                if (filter.category) {
                    coll.push(`CategoryID eq ${filter.category.CategoryID}`);
                }
                if (filter.type) {
                    var split = angular.isString(filter.type) ? filter.type.split(',') : [filter.type.toString()];
                    var sub = []
                    split.forEach(item => {
                        sub.push(`Organization/OrganizationType eq '${item}'`);
                    });
                    coll.push(`(${sub.join(' or ')})`);
                }
                if (coll.length !== 0)
                    url += `&$filter=${coll.join(' and ')}`;
            };
            $http.get(url).then(function (data) {
               // $scope.items = $rootScope.currentOrganizations = data.data;
            });
        }

        // load();

        $scope.select = function (item) {
            $scope.currentOrganization = item.Organization;
        };
        $scope.$on("$destroy", function () {
            filterChangeHandler();
        });
    };
    controller.$inject = ['$scope', '$http', 'settings', '$rootScope', '$stateParams'];
    angular.module('app').controller('organizationsController', controller);
})();