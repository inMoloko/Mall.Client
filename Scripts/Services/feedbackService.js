/**
 * Created by Nekrasov on 6/10/2017.
 */
(function () {
    'use strict';
    class FeedbackService {
        constructor($q, $linq, dbService) {
            this.$q = $q;
            this.$linq = $linq;
            this.dbService = dbService;
        }

        getAll(parentID = null) {
            let self = this;
            return self.dbService.getData().then(i => {
                return self.$linq.Enumerable().From(i.FeedbackCategories).Select(i => i.Value).Where(i => i.ParentID === parentID).ToArray();
            });
        }

    }
    FeedbackService.$inject = ['$q', '$linq', 'dbService'];
    angular
        .module('app')
        .service('feedbackService', FeedbackService);
})();