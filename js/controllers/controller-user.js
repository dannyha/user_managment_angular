'use strict';

/* Controllers */

//Search admin landing page
bpControllers.controller('UserSearchCtrl',
  function($scope, $route, $rootScope, $location, grmRequest) {
    $rootScope.containerClass = 'search-container user-container';
    $rootScope.activeTab = 'user-admin';
    
    //Save search
    if($rootScope.saveAdminSearch){
      $scope.serchData = $rootScope.saveAdminSearch;
      if($scope.serchData.role == 'ROLE_CSP_GUEST_MANAGER') {
        $scope.status = 'GUEST ADMIN' 
        $scope.role = $rootScope.accountTypes[1] 
      }else if($scope.serchData.role == 'ROLE_CSP_CONTEST_MANAGER'){
        $scope.status = 'CONTEST ADMIN'
        $scope.role = $rootScope.accountTypes[2]
      }else if($scope.serchData.role == 'ROLE_CSP_ADMIN'){
        $scope.status = 'USER ADMIN'
        $scope.role = $rootScope.accountTypes[0]
      }else {
        $scope.status = 'SELECT ROLE'  
      }
    }else{
      $scope.serchData = {}  
      $scope.status = 'SELECT ROLE'
    }

    $scope.changeStatus = function() {
      //console.log($scope.role)
      if($scope.role != null){
        $scope.status = $scope.role.name;
        $scope.serchData.role = $scope.role.value;  
      }else{
        $scope.status = 'SELECT ROLE'
        $scope.serchData.role = ''
      }
    }

    $scope.findUser = function() {

      $rootScope.saveAdminSearch = $scope.serchData
      var searchParams = $.param($scope.serchData);

      grmRequest.get('/users.json?' + searchParams).then(function(data) {
        //console.log(data.csp_users)
        if(data.csp_users != undefined){
          $rootScope.searchResults = data
          $location.path( "/user-results" );
        }else{
          $scope.open_fancybox();
        }
      });
    };

    $scope.newUser = function() {
      //$scope.hideForm = true;
      $location.path( "/user-new" );
    };

    $scope.reset = function() {
      $scope.serchData = {};
      $scope.serchData.email = '';
      $scope.status = 'SELECT ROLE';
      $scope.role = '';
    };
    
  });

//User admin search results page.
bpControllers.controller('UserResultsCtrl',
  function($scope, $route, $rootScope, $location) {
    
    $rootScope.containerClass = 'search-container user-container';
    $rootScope.activeTab = 'user-admin';

    if($rootScope.searchResults != undefined) {
      $scope.currentPage = 0;
      $scope.pageSize = 10;
      $scope.data = $rootScope.searchResults.csp_users;
      //console.log($scope.data)
      $scope.numberOfPages = function(){
        return Math.ceil($scope.data.length/$scope.pageSize);                
      }
    }else{
      $location.path( "/user-admin" );
    }

  });

//Edit Admin User details page.
bpControllers.controller('UserDetailsCtrl',
  function($scope, $route, $routeParams, $rootScope, $cookieStore, $window, $location, grmRequest) {
    $scope.$route = $route;
    $rootScope.containerClass = 'edit-container user-container';
    $rootScope.activeTab = 'user-admin';
    
    $scope.currentInfo = {"enabled":"true"}
    $scope.paramID = $routeParams.id
    $scope.editAccountForm;
    //$scope.master.push($scope.currentInfo)
    var call = '/users/' + $routeParams.id + '.json'
    grmRequest.get(call).then(function(data) {
      $scope.master = data
      $scope.master.enabled = "true"
      $scope.currentInfo.csp_user_id = $routeParams.id
      $scope.currentInfo.first_name = data.first_name
      $scope.currentInfo.last_name = data.last_name
      $scope.currentInfo.phone_number = data.phone_number
      $scope.currentInfo.username = data.username
      $scope.currentInfo.role = data.role
      if(data.role == 'ROLE_CSP_SUPER_USER' || data.role == 'ROLE_CSP_ADMIN'){
        $scope.status = 'USER ADMIN'
        $scope.role = $rootScope.accountTypes[0];
      }else if(data.role == 'ROLE_CSP_GUEST_MANAGER') {
        $scope.status = 'GUEST ADMIN'
        $scope.role = $rootScope.accountTypes[1];
      }else if(data.role == 'ROLE_CSP_CONTEST_MANAGER') {
        $scope.status = 'CONTEST ADMIN'
        $scope.role = $rootScope.accountTypes[2];
      }
      
    });
      
    $scope.changeStatus = function() {
      if(this.role != undefined){
        $scope.status = this.role.name;
        $scope.currentInfo.role = this.role.value;  
      }else{
        $scope.status = 'SELECT ROLE'
      }
    }

    $scope.updateUser = function() {
      //grmRequest.refresh()
      //console.log($scope.currentInfo);
      if($scope.editAccountForm.$valid){
        //update user data portion.
        grmRequest.post('/users/' + $routeParams.id + '.json', $scope.currentInfo).then(function(data) {
          $scope.master = data;
          if(!$scope.pwChange) {
            $scope.accountChanged()
          }else{
            //Change password portion
            grmRequest.post('/users/' + $routeParams.id + '/password.json', $scope.changePass).then(function(data) {
              $scope.pwChange = false;
              $scope.accountChanged()
            }, function(responce){
              $scope.serverError = responce;
            });
          }  
        }, function(responce){
          $scope.serverError = responce;
        });  
      }
    }

    $scope.changePassword = function() {
      $scope.pwChange = true;
      $scope.changePass = {}
    }

    $scope.accountChanged = function() {
      $scope.message = "Changed User Account.";
      $scope.boxAction = false
      $scope.open_fancybox();
    }

    $scope.removeAccount = function() {
      $scope.message = "Remove User Account?";
      $scope.boxAction = true
      $scope.open_fancybox();
    }

    $scope.accept = function() {
      grmRequest.delete('/users/'+$scope.paramID+'.json').then(function(data){
        $scope.close_fancybox();
        $scope.boxAction = false
        $location.path( "/user-admin" );
      });
    }

    $scope.close = function() {
      var role = $cookieStore.get('userinfo').role
      $scope.boxAction = false
      $scope.pwChange = false
      $scope.close_fancybox();
    
      if(role == 'ROLE_CSP_SUPER_USER' || role == 'ROLE_CSP_ADMIN'){
        $location.path( "/user-admin" );
      } else {
        $location.path( "/overview" );
      }
    
    }

    $scope.reset = function() {
      $scope.pwChange = false;
      $scope.currentInfo = angular.copy($scope.master)
      //$scope.role.value = $scope.currentInfo.role;
      $scope.changeStatus()
    };
  });

//Create New User Admin page.
bpControllers.controller('UserNewCtrl',
  function($scope, $route, $rootScope, grmRequest, $location) {
    $scope.$route = $route;
    $rootScope.containerClass = 'edit-container user-container';
    $rootScope.activeTab = 'user-admin';
    $scope.newAccountForm;
    $scope.status = 'SELECT ROLE'

    $scope.changeStatus = function() {
      //console.log($scope.role);
      if($scope.role != null){
        $scope.status = $scope.role.name;
        $scope.userData.role = $scope.role.value;  
      }else{
        $scope.status = 'SELECT ROLE'
        $scope.userData.role = ''
      }
    }
    
    $scope.master = {"enabled":"true"}
    $scope.userData = {"enabled":"true"}

    $scope.newUser = function() {
      if($scope.newAccountForm.$valid){
        grmRequest.post('/users/', $scope.userData).then(function(data) {
           //this will execute when the 
           //AJAX call completes.
           //console.log(data);
           $scope.message = "User was added."
           $scope.open_fancybox();
        }, function(responce){
          $scope.serverError = responce;
        });  
      }
    }

    $scope.close = function() {
      //console.log('clicked');
      $scope.close_fancybox();
      $location.path( "/user-admin" );
    }

    $scope.reset = function() {
      $scope.userData = angular.copy($scope.master)
      $scope.userData.username = '';
      $scope.role = '';
      $scope.status = 'SELECT ROLE';
    };

  });
