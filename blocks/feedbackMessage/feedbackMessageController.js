(function () {
	"use strict";
	var controller = function ($scope, $http, settings, $state, $rootScope, $stateParams) {
		//$state.go("navigation.searchResult", { CategoryID: $stateParams.CategoryID, Filter: $stateParams.Filter, OrganizationType: $stateParams.OrganizationType });
		this.$http = $http;
		this.settings = settings;
		this.$stateParams = $stateParams;
		this.$rootScope = $rootScope;
		this.$state = $state;
		this.$scope = $scope;
		$rootScope.selectPageName = "ОБРАТНАЯ СВЯЗЬ";
		this.$scope.item = {
			FeedbackMark: $stateParams.FeedbackMark,
			SelectedFeedbackCategory: $stateParams.FeedbackCategoryID,
			FeedbackCommentText: null,
			ApplicantName: null,
			ApplicantPhone: null,
			ApplicantEmail: null
		};
		// $(function () {
		//     jsKeyboard.init("virtualKeyboard");
		// });
		$rootScope.addStatistics('SendCommentCommand', this.$scope.item)
	};
	controller.prototype.save = function () {
		let self = this;
		// self.$http.post(self.settings.webApiBaseUrl + '/Feedback', self.$scope.item).then(function () {
		// 	self.$state.go("navigation.mainMenu");
		// });
		self.$state.go("navigation.mainMenu");
	};
	controller.$inject = ['$scope', '$http', 'settings', '$state', '$rootScope', '$stateParams'];
	angular.module('app').controller('feedbackMessageController', controller);
})();