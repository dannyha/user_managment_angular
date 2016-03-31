'use strict';

/* Controllers */

//controller for search page
bpControllers.controller('TeamHqSearchCtrl',
  function($scope, $route, $rootScope, $location, grmRequest) {
    $rootScope.containerClass = 'search-container user-container';
    $rootScope.activeTab = 'teamhq-admin';
    $rootScope.currentTeam = undefined;
    $scope.location = {};
    $scope.location.storeInfo = {};

    $scope.teamHqSearch = {};
    $scope.teamHqSearch.teamName = '';
    $scope.teamHqSearch.email = '';
    $scope.teamHqSearch.firstName = '';
    $scope.teamHqSearch.lastName = '';
    $scope.teamHqSearch.storeInfo = '';

    //Save search
    if($rootScope.saveTeamSearch){
      $scope.teamHqSearch = $rootScope.saveTeamSearch;
    }

    //enable/disable form find button
    $scope.checkFields = function() {
      if ($scope.teamHqSearch.teamName == '' && $scope.teamHqSearch.email == '' && $scope.teamHqSearch.firstName == '' && $scope.teamHqSearch.lastName == '' && $scope.location.storeInfo.store_id == undefined) {
        return true;
      } else {
        return false;
      }
    }
    
    $scope.findTeam = function() {
      if($scope.location.storeInfo.store_id != undefined) {
        $scope.teamHqSearch.bpStoreId = $scope.location.storeInfo.store_id;
      }
      $rootScope.saveTeamSearch = $scope.teamHqSearch;
      var searchParams = $.param($scope.teamHqSearch);
      grmRequest.get('/teams.json?' + searchParams).then(function(data) {
        if(data.length > 0){
          $rootScope.teamHqSearchResults = data
          $location.path( "/teamhq-results" );
        }else{
          $scope.open_fancybox();
        }
      });
    };

    $scope.reset = function() {
      $scope.teamHqSearch = {};
      $scope.location.reset = true;
    };

  });

//Controller for Search results page
bpControllers.controller('TeamHqResultsCtrl',
  function($scope, $route, $rootScope, $location, $filter) {
    $rootScope.containerClass = 'search-container user-container';
    $rootScope.activeTab = 'teamhq-admin';
    $rootScope.currentTeam = undefined;

    var orderBy = $filter('orderBy');
    $scope.order = function(predicate, reverse) {
      $scope.data = orderBy($scope.data, predicate, reverse);
    };

    if($rootScope.teamHqSearchResults == undefined) {
      $location.path( "/teamhq-admin" );
    }else{
      $scope.data = $rootScope.teamHqSearchResults;
      $scope.pagination = {};
      $scope.pagination.current = 0;
      $scope.pagination.size = 20;
      $scope.pagination.obj = $scope.data;
      $scope.pagination.back = '#/teamhq-admin';
    }

  });


//Team HQ Overview page.
bpControllers.controller('TeamHqOverviewCtrl',
  function($scope, $route, $routeParams, $rootScope, $location, $filter, teamHqData) {
    $rootScope.containerClass = 'user-container guest-details-container teamhq-overview-container';
    $rootScope.activeTab = 'teamhq-admin';
    $rootScope.subNav = 'teamhq-overview';
    $rootScope.team_id = $routeParams.id;

    if ($rootScope.currentTeam == undefined) {
      teamHqData.get($rootScope.team_id).then(
        function(data) {
          $rootScope.currentTeam = data;
        }
      );
    }

  });


//Team HQ Edit Profile page.
bpControllers.controller('TeamHqEditProfileCtrl',
  function($scope, $route, $routeParams, $rootScope, $location, $filter, grmRequest, teamHqData) {
    $rootScope.containerClass = 'user-container guest-details-container teamhq-overview-container';
    $rootScope.activeTab = 'teamhq-admin';
    $rootScope.subNav = 'teamhq-edit-profile';
    $rootScope.team_id = $routeParams.id;

    $scope.teamHqProfile = {};
    $scope.location = {};
    $scope.location.showButton = true;
    $scope.location.showFields = false;

    $scope.modal = {};
    $scope.modal.msg = '';

    teamHqData.set($rootScope.currentTeam, $rootScope.team_id).then(
      function(data) {
        $rootScope.currentTeam = data;
      }
    );

    $scope.$watch('currentTeam.info', function(){
      console.log($rootScope.currentTeam);
      if ($rootScope.currentTeam != undefined) {
        $scope.teamHqProfile.name = $rootScope.currentTeam.info.name;
        $scope.teamHqProfile.location = $rootScope.currentTeam.info.store_name;
        for (var capt in $rootScope.currentTeam.eligibleCaptains) {
          if ($rootScope.currentTeam.eligibleCaptains[capt].email == $rootScope.currentTeam.info.captain_email) {
            $scope.teamHqProfile.changeCaptain = $rootScope.currentTeam.eligibleCaptains[capt];
          }
        }
      }
    });

    $scope.changeCurrentLocation = function() {
      $scope.location.showButton = false;
      $scope.location.showFields = true;
      $scope.location.currentId = $rootScope.currentTeam.info.store_id;
    }

    $scope.saveProfile = function() {
      var data = {};

      data.bp_store_id = ($scope.location.storeInfo.store_id == undefined) ? $rootScope.currentTeam.info.store_id : $scope.location.storeInfo.store_id;
      data.guest_id = ($scope.teamHqProfile.changeCaptain != undefined) ? $scope.teamHqProfile.changeCaptain.guest_id : "";
      data.team_name = $scope.teamHqProfile.name;

      grmRequest.post('/teams/' + $routeParams.id + '.json', data).then(function(data) {
        $scope.modal.msg = 'Profile Saved!';
        $rootScope.currentTeam.info = data;
      }, function(data){
        $scope.modal.msg = 'Error Saving Profile. Try again!';
      });
    }

  });


//Team HQ Edit Roster page.
bpControllers.controller('TeamHqEditRosterCtrl',
  function($scope, $route, $routeParams, $rootScope, $location, $filter, teamHqData, grmRequest) {
    $rootScope.containerClass = 'user-container guest-details-container teamhq-overview-container';
    $rootScope.activeTab = 'teamhq-admin';
    $rootScope.subNav = 'teamhq-edit-roster';
    $rootScope.team_id = $routeParams.id;

    $scope.paginationInvites = {}
    $scope.paginationInvites.current = 0;
    $scope.paginationInvites.size = 10;
    $scope.paginationInvites.obj = {};
    
    $scope.paginationMembers = {}
    $scope.paginationMembers.current = 0;
    $scope.paginationMembers.size = 10;
    $scope.paginationMembers.obj = {};

    $scope.modal = {};
    $scope.modal.msg = '';

    teamHqData.set($rootScope.currentTeam, $rootScope.team_id).then(
      function(data) {
        $rootScope.currentTeam = data;
        $scope.data = $rootScope.currentTeam.members;
      }
    );

    $scope.$watch('currentTeam', function(){
      if ($rootScope.currentTeam != undefined) {
        $scope.paginationInvites.obj = $rootScope.currentTeam.invites;
        $scope.paginationMembers.obj = $rootScope.currentTeam.members;
      }
    });

    var orderBy = $filter('orderBy');
    $scope.order = function(predicate, reverse) {
      console.log($scope.data)
      console.log(predicate)
      console.log(reverse)
      //$scope.data = orderBy($scope.data, predicate, reverse);
    };

    $scope.updateMembers = function(mid) {
      grmRequest.get('/teams/'+ $rootScope.team_id +'/members.json').then(function(data){
        $rootScope.currentTeam.members = data;
      },function(response){
      });
    }

    $scope.removeMember = function(mid) {
      grmRequest.delete('/teams/'+ $rootScope.team_id +'/members/'+ mid +'.json').then(function(data){
        $scope.modal.msg = 'Member Removed';
        $rootScope.currentTeam.members = data;
      },function(response){
        $scope.modal.msg = 'Error Removing Member. Try again!';
      });
    }

    $scope.setInviteeStatus = function(mid, type) {
      if (type == true) {
        grmRequest.post('/teams/'+ $rootScope.team_id +'/invitations/'+ mid +'.json','').then(function(data){
          $scope.modal.msg = 'Pending Invitation Approved';
          $rootScope.currentTeam.invites = data;
          $scope.updateMembers(mid);
        },function(response){
          $scope.modal.msg = 'Error Approving Pending Invitation! Try again later.';
        });
      } else {
        grmRequest.delete('/teams/'+ $rootScope.team_id +'/invitations/'+ mid +'.json').then(function(data){
          $scope.modal.msg = 'Pending Invitation Rejected';
          $rootScope.currentTeam.invites = data;
        },function(response){
          $scope.modal.msg = 'Error Rejected Pending Invitation. Try again!';
        });
      }
    }

  });


//Team HQ Edit Rewards page.
bpControllers.controller('TeamHqEditRewardsCtrl',
  function($scope, $route, $routeParams, $rootScope, $location, $filter, teamHqData, grmRequest) {
    $rootScope.containerClass = 'user-container guest-details-container teamhq-overview-container';
    $rootScope.activeTab = 'teamhq-admin';
    $rootScope.subNav = 'teamhq-edit-rewards';
    $rootScope.team_id = $routeParams.id;

    $scope.modal = {};
    $scope.modal.msg = '';

    $scope.foodCredit = {}
    $scope.foodCredit.expiry = '';
    $scope.foodCredit.member = '';
    $scope.foodCredit.memberSelected = 'Select';
    $scope.foodCredit.amount = 0;
    $scope.foodCredit.receipt = '';

    $scope.pagination = {}
    $scope.pagination.current = 0;
    $scope.pagination.size = 10;
    $scope.pagination.obj = {};

    grmRequest.get('/teams/'+ $rootScope.team_id +'/submissions.json').then(function(data){
      $scope.currentTransactions = data;
      $scope.pagination.obj = data;
    });

    teamHqData.set($rootScope.currentTeam, $rootScope.team_id).then(
      function(data) {
        $rootScope.currentTeam = data;
      }
    );

    $scope.$watch('currentTeam', function() {
      if ($rootScope.currentTeam != undefined) {
        var anniversary = new Date($rootScope.currentTeam.info.anniversary);
        var setMinDate = new Date($rootScope.currentTeam.info.anniversary).setDate(anniversary.getDate()-30);
        var setMaxDate = new Date($rootScope.currentTeam.info.anniversary).setDate(anniversary.getDate()+30);
        $scope.foodCredit.expiry = new Date(anniversary.toDateString());
        $scope.dateOptions = {
          minDate: new Date(setMinDate), 
          maxDate: new Date(setMaxDate)
        };
      }
    });

    $scope.saveFoodCreditExpiry = function() {
      var anniversary = new Date($scope.foodCredit.expiry);
      var setDate = $filter('convertDateYYYYMMDD');
      var anniversaryData = {
        anniversary: setDate(anniversary)
      }

      grmRequest.post('/teams/'+ $rootScope.team_id +'/anniversary.json', anniversaryData).then(function(data){
        $scope.modal.msg = 'Food Credit Expiry Date Updated!';
        $rootScope.currentTeam.info = data;
      },function(response){
        $scope.modal.msg = 'Error Updating Food Credit Expiry Date. Try again!';
      });

    }

    $scope.foodCreditMemberChanged = function() {
      $scope.foodCredit.memberSelected = $scope.foodCredit.member.first_name + " " + $scope.foodCredit.member.last_name;
    }

    var bgReceiptNumber = $filter('bgReceiptNumber');
    $scope.checkReceiptInput = function() {
      if ($scope.foodCredit.receipt != '') {
        $scope.foodCredit.receipt = bgReceiptNumber($scope.foodCredit.receipt);
      }
    }

    $scope.addFoodCreditReceipt = function() {
      var dataObj = {
        receipt_number: $scope.foodCredit.receipt,
        team_member_id: $scope.foodCredit.member.team_member_id
      }
      grmRequest.post('/teams/'+ $rootScope.team_id +'/submissions.json', dataObj).then(function(data){
        $scope.modal.msg = 'Receipt Code Added!';
        $rootScope.currentTeam.info = data;
      },function(response){
        $scope.modal.msg = 'Error Adding Receipt Code. Try again!';
      });
    }

    $scope.addFoodCreditAmount = function() {
      var dataObj = {
        amount: $scope.foodCredit.amount
      }
      grmRequest.post('/teams/'+ $rootScope.team_id +'/rewards.json', dataObj).then(function(data){
        $scope.modal.msg = 'Food Credit Amount of $' + $scope.foodCredit.amount + ' Added!';
        $scope.foodCredit.amount = 0;
        $rootScope.currentTeam.info = data;
      },function(response){
        $scope.modal.msg = 'Error Adding Food Credit Amount. Try again!';
      });
    }

  });


//Team HQ Status page.
bpControllers.controller('TeamHqStatusCtrl',
  function($scope, $route, $routeParams, $rootScope, $location, $filter, teamHqData, grmRequest) {
    $rootScope.containerClass = 'user-container guest-details-container teamhq-overview-container';
    $rootScope.activeTab = 'teamhq-admin';
    $rootScope.subNav = 'teamhq-status';
    $rootScope.team_id = $routeParams.id;

    $scope.modal = {};
    $scope.modal.msg = '';

    $scope.$watch('modal.action', function(){
      if($scope.modal.action == true) {
        $scope.disbandTeam();
      }
    });

    teamHqData.set($rootScope.currentTeam, $rootScope.team_id).then(
      function(data) {
        $rootScope.currentTeam = data;
        console.log($rootScope.currentTeam);
      }
    );

    $scope.confirmDisband = function() {
      $scope.modal.confirm = false;
      $scope.modal.msg ='Are you sure?';
    }

    $scope.disbandTeam = function() {
      grmRequest.delete('/teams/'+ $rootScope.team_id +'.json').then(function(data){
        $scope.modal.msg = 'Team has been disbanded';
        $rootScope.currentTeam.info = data;
      },function(response){
        $scope.modal.msg = 'Error Disbanding Team. Try Again!';
      });
    }

  });