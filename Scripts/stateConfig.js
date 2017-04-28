(function () {
    "use strict";
    var app = angular.module('app');
    app.config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {

        $urlRouterProvider.otherwise('/navigation/mainMenu');

        // States
        $stateProvider
            .state('navigation', {
                url: "/navigation",
                templateUrl: 'blocks/navigation/navigation.html',
                fullScreen: true,
                resetMap: true
            })
            .state('navigation.mainMenu', {
                url: '/mainMenu',
                views: {
                    'mainMenu': {
                        templateUrl: 'blocks/sideMenu/sideMenu.html',
                        controller: 'mainMenuController'
                    }
                },
                resetMap: true
            })
            .state('navigation.organization', {
                url: '/organization/:OrganizationID?MapObjectID',
                views: {
                    'organization@main': {
                        templateUrl: 'blocks/organization/organization.html',
                        controller: 'organizationController'
                    }
                },
                reloadOnSearch: false
            })
            .state('navigation.shedule', {
                url: '/navigation.shedule',
                views: {
                    'mainMenu': {
                        templateUrl: 'blocks/sheduleControl/sheduleControl.html',
                        controller: 'mainMenuController'
                    }
                }
            })
            /* Сюда переходим когда выбранна оргия на карте*/
            .state('navigation.mainMenu.organization', {
                url: '/organization/:OrganizationID?MapObjectID',
                views: {
                    'organization@main': {
                        templateUrl: 'blocks/organization/organization.html',
                        controller: 'organizationController'
                    }
                },
                reloadOnSearch: false
            })
            .state('navigation.mainMenu.organization.proposalsList', {
                url: '/proposalsList/:OrganizationID',
                views: {
                    'proposalsList@main': {
                        controller: 'organizationProposalListController',
                        templateUrl: 'blocks/organizationProposalListControl/organizationProposalListControl.html'
                    }
                }
            })
            .state('navigation.mainMenu.organization.proposalsList.proposal', {
                url: '/proposal/:ProposalID',
                views: {
                    'proposal@main': {
                        controller: 'proposalController',
                        templateUrl: 'blocks/organizationProposalControl/organizationProposalControl.html'
                    }
                }
            })
            .state('navigation.organization.proposalsList', {
                url: '/proposalsList/:OrganizationID',
                views: {
                    'proposalsList@main': {
                        controller: 'organizationProposalListController',
                        templateUrl: 'blocks/organizationProposalListControl/organizationProposalListControl.html'
                    }
                }
            })
            .state('navigation.organization.proposalsList.proposal', {
                url: '/proposal/:ProposalID',
                views: {
                    'proposal@main': {
                        controller: 'proposalController',
                        templateUrl: 'blocks/organizationProposalControl/organizationProposalControl.html'
                    }
                }
            })
            /* Схлопнуты результаты поиска*/
            .state('navigation.closedResult', {
                url: '/closedResult/?CategoryID&Filter&OrganizationType',
                views: {
                    'searchResult': {
                        templateUrl: 'blocks/closedResult/closedResult.html',
                        controller: 'closeResultController'
                    }
                }
            })
            .state('navigation.closedResult.organization', {
                url: '/organization/:OrganizationID?MapObjectID',
                views: {
                    'organization@main': {
                        templateUrl: 'blocks/organization/organization.html',
                        controller: 'organizationController'
                    }
                },
                reloadOnSearch: false
            })
            .state('navigation.searchResult', {
                url: '/searchResult/?CategoryID&Filter&OrganizationType',
                views: {
                    'searchResult': {
                        templateUrl: 'blocks/organizationsList/organizationsList.html',
                        controller: 'organizationsListController'
                    }
                },
                reloadOnSearch: false
            })
            .state('navigation.searchResult.organization', {
                url: '/organization/:OrganizationID?MapObjectID',
                views: {
                    'organization@main': {
                        templateUrl: 'blocks/organization/organization.html',
                        controller: 'organizationController'
                    }
                }
            })
            .state('navigation.searchResult.organization.proposalsList', {
                url: '/proposalsList/:OrganizationID',
                views: {
                    'proposalsList@main': {
                        controller: 'organizationProposalListController',
                        templateUrl: 'blocks/organizationProposalListControl/organizationProposalListControl.html'
                    }
                }
            })
            .state('navigation.searchResult.organization.proposalsList.proposal', {
                url: '/proposal/:ProposalID',
                views: {
                    'proposal@main': {
                        controller: 'proposalController',
                        templateUrl: 'blocks/organizationProposalControl/organizationProposalControl.html'
                    }
                }
            })
            .state('navigation.searchResult.organization.cinemaTimetable', {
                url: '/cinemaTimetable',
                views: {
                    'proposal@main': {
                        controller: 'cinemaTimetableController',
                        templateUrl: 'blocks/cinemaTimetable/cinemaTimetable.html',
                        controllerAs: 'controller'
                    }
                }
            })

            .state('searchResultFull', {
                url: "/searchResultFull",
                templateUrl: "blocks/searchResultFull/searchResultFull.html"
            })
            .state('searchResultFull.result', {
                url: "/result/?CategoryID&Filter&OrganizationType",
                views: {
                    'searchResultFull': {
                        templateUrl: 'blocks/organizationsList/organizationsList.html',
                        controller: 'organizationsListController'
                    }
                },
                reloadOnSearch: false
            })

            .state('transport', {
                url: "/transport?TransportRouteID&BusStopID",
                templateUrl:'blocks/transport/transport.html',
            })
            .state('transport.searchResult', {
                url: "/searchResult?TransportRouteID&BusStopID",
                views: {
                    'searchResult@transport': {
                        controller: 'transportController',
                        templateUrl: "blocks/transportSearchResult/transportSearchResult.html",
                        controllerAs: 'controller'
                    }
                }
            })
            .state('transport.searchResult.closedResult', {
                url: "/closedResult?TransportRouteID&BusStopID",
                views: {
                    'searchResult@transport': {
                        controller: 'transportController',
                        templateUrl: "blocks/transportCloseResult/transportCloseResult.html",
                        controllerAs: 'controller'
                    }
                }
            })

            .state('screensaver', {
                url: "/screensaver",
                controller: 'screensaverController',
                templateUrl: "blocks/screensaver/screensaver.html"
            })

            .state('feedback', {
                url: "/feedback",
                templateUrl: "blocks/feedback/feedBack.html"
            })
            .state('feedback.category', {
                url: "/category",
                views: {
                    'feedbackCategory@feedback': {
                        templateUrl: 'blocks/feedbackCategory/feedbackCategory.html',
                        controller: 'feedbackCategoryController',
                        controllerAs: 'controller'
                    }
                }
            })
            .state('feedback.category.mark', {
                url: "/mark/:FeedbackCategoryID",
                views: {
                    'feedbackMark@feedback': {
                        templateUrl: 'blocks/feedbackMark/feedbackMark.html'
                    }
                }
            })
            .state('feedback.category.mark.message', {
                url: "/message/:FeedbackMark",
                views: {
                    'feedbackMessage@feedback': {
                        templateUrl: 'blocks/feedbackMessage/feedbackMessage.html',
                        controller: 'feedbackMessageController',
                        controllerAs: 'controller'
                    }
                }
            })
            .state('proposals', {
                url: "/proposals",
                controller: 'proposalsController',
                templateUrl: "blocks/proposals/proposals.html"
            })
            .state('proposals.searchResult', {
                url: "/searchResult",
                views: {
                    'proposalsList': {
                        controller: 'proposalListController',
                        templateUrl: 'blocks/proposalListControl/proposalListControl.html'
                    }
                }
            })
            .state('proposals.searchResult.proposal', {
                url: "/proposal/:ProposalID",
                views: {
                    'proposal@main': {
                        controller: 'proposalController',
                        templateUrl: 'blocks/proposalControl/proposalControl.html'
                    }
                }
            })
            .state('proposals.proposalsList', {
                url: "/proposalsList",
                views: {
                    'proposalsList': {
                        controller: 'proposalListController',
                        templateUrl: 'blocks/proposalListControl/proposalListControl.html'
                    }
                }
            })
            .state('proposals.proposalsList.proposal', {
                url: "/proposal/:ProposalID",
                views: {
                    'proposal@main': {
                        controller: 'proposalController',
                        templateUrl: 'blocks/proposalControl/proposalControl.html'
                    }
                }
            })
            .state('events', {
                url: "/events",
                templateUrl: "blocks/events/events.html"
            })
            .state('events.searchResult', {
                url: "/searchResult",
                views: {
                    'eventsList': {
                        templateUrl: 'blocks/eventsListControl/eventsListControl.html',
                        controller: 'eventListController',
                        controllerAs: 'controller'
                    }
                }
            })
            .state('events.searchResult.event', {
                url: "/event/:EventID",
                views: {
                    'event@main': {
                        templateUrl: 'blocks/eventControl/eventControl.html',
                        controller: 'eventController',
                        controllerAs: 'controller'
                    }
                }
            })
            .state('events.eventsList', {
                url: "/eventsList",
                views: {
                    'eventsList': {
                        controller: 'eventListController',
                        templateUrl: 'blocks/eventsListControl/eventsListControl.html'
                    }
                }
            })
            .state('events.eventsList.event', {
                url: "/event/:EventID",
                views: {
                    'event@main': {
                        controller: 'eventController',
                        templateUrl: 'blocks/eventControl/eventControl.html'
                    }
                }
            });
    }]);
})();
