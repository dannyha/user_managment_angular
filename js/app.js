'use strict';

/* App Module */

var bpApp = angular.module('bpApp', [
  'ngRoute'
  ,'ngCookies'
  ,'ui.date'
  //,'phonecatAnimations'
  ,'bpControllers'
  //,'bpFilters'
  ,'bpServices'
  ,'bpDirectives'
  ,'ngFileUpload'
]);

bpApp.config(['$routeProvider', '$httpProvider',
  function($routeProvider, $httpProvider) {
    //$httpProvider.defaults.useXDomain = true;
    //delete $httpProvider.defaults.headers.common['X-Requested-With'];
    $httpProvider.interceptors.push('AuthInterceptor');

    $routeProvider.
      when('/overview', { templateUrl: 'partials/overview.html', controller: 'OverviewCtrl'})
      .when('/login', { templateUrl: 'partials/login.html', controller: 'LoginCtrl'})
      .when('/reset-pass', { templateUrl: 'partials/reset-pass.html', controller: 'LoginCtrl'})
      .when('/user-admin', { templateUrl: 'partials/user/user-search.html', controller: 'UserSearchCtrl' })
      .when('/user-results', { templateUrl: 'partials/user/user-results.html', controller: 'UserResultsCtrl' })
      .when('/user-new', { templateUrl: 'partials/user/user-new.html', controller: 'UserNewCtrl' })
      //.when('/user-details', { templateUrl: 'partials/user/user-details.html', controller: 'UserDetailsCtrl' }) // removed because we are using the userID
      .when('/user-details/:id', { templateUrl: 'partials/user/user-details.html', controller: 'UserDetailsCtrl' }) // this is for search results.
      .when('/guest-admin', { templateUrl: 'partials/guest/guest-search.html', controller: 'GuestSearchCtrl' })
      .when('/guest-results', { templateUrl: 'partials/guest/guest-results.html', controller: 'GuestResultsCtrl' })
      .when('/guest-new', { templateUrl: 'partials/guest/guest-new.html', controller: 'GuestNewCtrl' })
      //.when('/guest-details', { templateUrl: 'partials/guest/guest-details.html', controller: 'GuestDetailsCtrl' }) // removed because we are using the userID
      .when('/guest-details/:id', { templateUrl: 'partials/guest/guest-details.html', controller: 'GuestDetailsCtrl' })
      .when('/guest-order-history/:id', { templateUrl: 'partials/guest/guest-order-history.html', controller: 'GuestOrderHistoryCtrl' })
      .when('/guest-offers/:id', { templateUrl: 'partials/guest/guest-offers.html', controller: 'GuestOffersCtrl' })
      .when('/guest-communication-preferences/:id', { templateUrl: 'partials/guest/guest-preferences.html', controller: 'GuestPreferencesCtrl' })
      .when('/guest-activity-statistics/:id', { templateUrl: 'partials/guest/guest-activity.html', controller: 'GuestActivityCtrl' })
      .when('/guest-emails/:id', { templateUrl: 'partials/guest/guest-emails.html', controller: 'GuestEmailsCtrl' })
      .when('/guest-unlock-special-offers/:id', { templateUrl: 'partials/guest/guest-unlock-special-offers.html', controller: 'GuestUnlockSpecialOffersCtrl' })
      .when('/guest-teamhq/:id', { templateUrl: 'partials/guest/guest-teamhq.html', controller: 'GuestTeamHQCtrl' })
      .when('/contest-admin', { templateUrl: 'partials/contest/contest-admin.html', controller: 'ContestAdminCtrl' })
      .when('/offers-admin', { templateUrl: 'partials/offer/offers-admin.html', controller: 'OffersAdminCtrl' })
      .when('/promotion-actions', { templateUrl: 'partials/promotion/promotion-actions.html', controller: 'PromotionActionCtrl' })
      .when('/promotion-offers', { templateUrl: 'partials/promotion/promotion-offers.html', controller: 'PromotionOfferCtrl' })
      .when('/promotion-rules', { templateUrl: 'partials/promotion/promotion-rules.html', controller: 'PromotionRuleCtrl' })
      .when('/promotion-triggers', { templateUrl: 'partials/promotion/promotion-triggers.html', controller: 'PromotionTriggerCtrl' })
      .when('/teamhq-admin', { templateUrl: 'partials/teamhq/teamhq-search.html', controller: 'TeamHqSearchCtrl' })
      .when('/teamhq-results', { templateUrl: 'partials/teamhq/teamhq-results.html', controller: 'TeamHqResultsCtrl' })
      .when('/teamhq-overview/:id', { templateUrl: 'partials/teamhq/teamhq-overview.html', controller: 'TeamHqOverviewCtrl' })
      .when('/teamhq-edit-profile/:id', { templateUrl: 'partials/teamhq/teamhq-edit-profile.html', controller: 'TeamHqEditProfileCtrl' })
      .when('/teamhq-edit-roster/:id', { templateUrl: 'partials/teamhq/teamhq-edit-roster.html', controller: 'TeamHqEditRosterCtrl' })
      .when('/teamhq-edit-rewards/:id', { templateUrl: 'partials/teamhq/teamhq-edit-rewards.html', controller: 'TeamHqEditRewardsCtrl' })
      .when('/teamhq-status/:id', { templateUrl: 'partials/teamhq/teamhq-status.html', controller: 'TeamHqStatusCtrl' })
      .when('/transaction-finder', { templateUrl: 'partials/transactions/transactions-search.html', controller: 'transactionsSearchCtrl' })
      .when('/transaction-results', { templateUrl: 'partials/transactions/transactions-results.html', controller: 'transactionsResultsCtrl' })
      .when('/transaction-overview/:id', { templateUrl: 'partials/transactions/transactions-overview.html', controller: 'transactionsOverviewCtrl' })
      .otherwise({ redirectTo: '/overview' });

  }]);

bpApp.run(function($rootScope, $window, $location, $cookieStore, $route, grmRequest) {
  $rootScope.provinces = [{"n":"Alberta","v":"AB"},{"n":"British Columbia","v":"BC"},{"n":"Manitoba","v":"MB"},{"n":"New Brunswick","v":"NB"},{"n":"Newfoundland","v":"NL"},{"n":"Northwest Territories","v":"NT"},{"n":"Nova Scotia","v":"NS"},{"n":"Nunavut","v":"NU"},{"n":"Ontario","v":"ON"},{"n":"Prince Edward Island","v":"PE"},{"n":"Quebec","v":"QC"},{"n":"Saskatchewan","v":"SK"},{"n":"Yukon Territory","v":"YT"}];
  $rootScope.languages = [{"n":"English","v":"EN"},{"n":"French","v":"FR"}];
  $rootScope.genders = [{"n":"Male","v":"M"},{"n":"Female","v":"F"},{"n":"Undisclosed","v":"U"}];
  $rootScope.ageRanges = [{"n":"13-17","v":"THIRTEEN_TO_SEVENTEEN"},
  {"n":"18-24","v":"EIGHTEEN_TO_TWENTY_FOUR"},
  {"n":"25-34","v":"TWENTY_FIVE_TO_THIRTY_FOUR"},
  {"n":"35-44","v":"THIRTY_FIVE_TO_FORTY_FOUR"},
  {"n":"45-54","v":"FORTY_FIVE_TO_FIFTY_FOUR"},
  {"n":"55 and over","v":"FIFTY_FIVE_AND_OVER"}];
  $rootScope.accountTypes = [{'name':'USER ADMIN', 'value':'ROLE_CSP_ADMIN'},{'name':'GUEST ADMIN', 'value':'ROLE_CSP_GUEST_MANAGER'},{'name':'CONTEST ADMIN', 'value':'ROLE_CSP_CONTEST_MANAGER'},{'name':'PROMOTION ADMIN', 'value':'ROLE_CSP_PROMOTION_MANAGER'}];
  $rootScope.processing = false;
  $rootScope.expired = false;
  $rootScope.renewed = false;
  $rootScope.renewCount = 0;
  
  $rootScope.promotionTriggerFields = [{"n":"BALANCE","v":"BALANCE"},{"n":"MENU_ITEM","v":"MENU_ITEM"},{"n":"PROVINCE","v":"PROVINCE"}];
  $rootScope.promotionActionTypes = [{"n":"ENROLL","v":"ENROLL"},{"n":"INCREMENT","v":"INCREMENT"}, {"n":"TEAMHQ","v":"TEAMHQ"}];
  $rootScope.promotionCodes = [{"n":"RECEIPT","v":"RECEIPT"},{"n":"OFFER","v":"OFFER"},{"n":"KIDCARD","v":"KIDCARD"}];
  $rootScope.receiptStatus = [{"n":"PENDING","v":"PENDING"},{"n":"DECLINED","v":"DECLINED"},{"n":"PROCESSED","v":"PROCESSED"}];
  $rootScope.promotionTriggerTypes = [
  {"n":"GREATER_THAN","v":"GREATER_THAN"},
  {"n":"GREATER_THAN_EQUALS","v":"GREATER_THAN_EQUALS"},
  {"n":"EQUALS","v":"EQUALS"},
  {"n":"LESS_THAN_EQUALS","v":"LESS_THAN_EQUALS"},
  {"n":"LESS_THAN","v":"LESS_THAN"}];
 
  $rootScope.actionOffers=[]; 
  grmRequest.get('/offers/').then(function(data) { 
    if(data != undefined){
      $rootScope.actionOffers=[]; 
      angular.forEach(data, function(obj) {
        var currentOffer = {};
        currentOffer.v = obj.walletCode;
        currentOffer.n = obj.walletCode;
        $rootScope.actionOffers.push(currentOffer);
      });
    }else{
     $rootScope.contests={};
    }        
  });  

  $rootScope.actionContests=[];                 
  grmRequest.get('/contests/').then(function(data) { 
    if(data.contests != undefined){
      $rootScope.actionContests=[]; 
      angular.forEach(data.contests, function(obj) {
        var currentContest = {};
        currentContest.v = obj.contest_code;
        currentContest.n = obj.contest_code;
        $rootScope.actionContests.push(currentContest);
      });
    }else{
     $rootScope.contests={};
    }      
  });  
     
  $rootScope.$on( "$locationChangeStart", function(event, next, current) {
    
    if($cookieStore.get('userinfo') != undefined){
      $rootScope.userDetails = $cookieStore.get('userinfo')
    }
    
    if ( $window.sessionStorage.getItem('token') == null ) {
      
      if($location.url() != '/reset-pass'){
        $location.path( "/login" );  
      }
    
    }

    //Logout Function removes session storage
    $rootScope.logout = function() {
      $rootScope.expired = false;

      //close fancybox
      $rootScope.viewBox = '';
      $.fancybox.close();

      $window.sessionStorage.removeItem('token');
      $window.sessionStorage.removeItem('userid');
      $window.sessionStorage.removeItem('refresh');
      $cookieStore.remove('userinfo')
      $location.path( "/login" );
    }

    $rootScope.tokenRenew = function() {
      $rootScope.renewCount += 1;
      grmRequest.refresh().then(function(result){
        $rootScope.expired = false;
        $rootScope.renewed = true;
        $window.sessionStorage.setItem('token', result.access_token);
        $window.sessionStorage.setItem('refresh', result.refresh_token);
        $route.reload();
      }, function(result) {
        //if the tokan fails to get reset logout.
        if ($rootScope.renewCount < 5) {
          window.setTimeout(function(){
            $rootScope.tokenRenew();
          },4000);
        } else {
          $rootScope.renewCount = 0;
          $rootScope.logout(); 
        }
      });
    }

    $rootScope.closeRenew = function() {
      $rootScope.renewed = false;
    }
    
  });
});


/* Initialize App Controllers */
var bpControllers = angular.module('bpControllers', []);
var bpDirectives = angular.module('bpDirectives', []);
var bpServices = angular.module('bpServices', []);
var bpFilters = angular.module('bpFilters', []);

