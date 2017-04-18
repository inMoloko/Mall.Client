(function () {
    "use strict";
    var controller = function ($scope, $http, settings, $state, $rootScope, $stateParams) {
        //$state.go("navigation.searchResult", { CategoryID: $stateParams.CategoryID, Filter: $stateParams.Filter, OrganizationType: $stateParams.OrganizationType });
        this.$http = $http;
        this.settings = settings;
        this.$stateParams = $stateParams;
        this.$rootScope = $rootScope;
        this.$scope = $scope;
        this.$state = $state;

        if ($rootScope.feedbackCategories === undefined) {
            let event = $rootScope.$on('floorLoad', function () {
                $scope.categories = $rootScope.feedbackCategories.filter(i => i.ParentID == null);
                event();
            });

        }
        else {
            $scope.categories = $rootScope.feedbackCategories.filter(i => i.ParentID == null);
        }
        $rootScope.selectPageName = "ОБРАТНАЯ СВЯЗЬ";
    };
    controller.prototype.select = function (feedbackCategory) {
        let self = this;
        if (feedbackCategory.FeedbackCategoryID === -1) {
            self.$scope.categories = self.$rootScope.feedbackCategories.filter(i => i.ParentID == null);
            return;
        }
        let result = self.$rootScope.feedbackCategories.filter(i => i.ParentID == feedbackCategory.FeedbackCategoryID);
        if (result && result.length !== 0) {
            self.$scope.categories = result;
            //self.$scope.categories.push({ FeedbackCategoryID: -1, Name: 'Назад' });
        } else {
            self.$state.go('.mark', { FeedbackCategoryID: feedbackCategory.FeedbackCategoryID });
        }

    };
    controller.$inject = ['$scope', '$http', 'settings', '$state', '$rootScope', '$stateParams'];
    angular.module('app').controller('feedbackCategoryController', controller);
})();