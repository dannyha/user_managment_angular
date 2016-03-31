'use strict';

/* Controllers */

bpControllers.controller('LoginCtrl',
  function($scope, $window, $location, $rootScope, $cookieStore, grmRequest) {
    $rootScope.containerClass = 'login-container';
    $rootScope.activeTab = '';
    $scope.serverReply = '';

    if($window.sessionStorage.getItem('token') != undefined) {
      $location.path( "/overview" );
    }
    $scope.runLogin = function() {
      grmRequest.login($scope.credentials).then(function(data) {
        //console.log(data)
        $window.sessionStorage.setItem('token', data.access_token);
        $window.sessionStorage.setItem('userid', data.csp_user_id);
        $window.sessionStorage.setItem('refresh', data.refresh_token);
        $location.path( "/overview" );
      },function(response){
        $scope.serverReply = response
      });
    };

    $scope.resetPass = function() {
      if($scope.credentials.username){
        grmRequest.reset($scope.credentials.username).then(function(data){
          $scope.message = data.message;
          $scope.open_fancybox();
        });
      }else{
        $scope.message = 'Please enter an email address.'
        $scope.open_fancybox();
      }
    }

    $scope.closeBox = function() {
      $scope.close_fancybox();
      $location.path( "/login" );
    }
  });

