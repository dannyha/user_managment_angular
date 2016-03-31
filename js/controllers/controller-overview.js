'use strict';

/* Controllers */

bpControllers.controller('OverviewCtrl',
  function($scope, $route, $rootScope, grmRequest, $window, $cookieStore) {
    $scope.$route = $route;
    $rootScope.containerClass = 'overview-container';
    $rootScope.activeTab = 'overview';
    $scope.userid = $window.sessionStorage.getItem('userid');
    
    
    grmRequest.get('/users/' + $scope.userid).then(function(data) {
      $cookieStore.put('userinfo', data);
      $rootScope.userDetails = $cookieStore.get('userinfo');
      //console.log($rootScope.userDetails)
    });  
  });
