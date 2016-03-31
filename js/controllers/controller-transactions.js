'use strict';

/* Controllers */

//controller for search page
bpControllers.controller('transactionsSearchCtrl',
  function($scope, $route, $rootScope, $location, $filter, grmRequest) {
    $rootScope.containerClass = 'search-container user-container';
    $rootScope.activeTab = 'transaction-finder';

    $scope.location = {};
    $scope.locationCheck = {};

    $scope.modal = {};
    $scope.modal.msg = '';

    $scope.dateOptions = {
      minDate: -365, 
      maxDate: 0
    };

    $scope.timeRange = [
      {value:"1", name:"Lunch (Open to 2:00pm)"},
      {value:"2", name:"Afternoon (2:00pm to 5:00pm)"},
      {value:"3", name:"Dinner (5:00pm to 8:00pm)"},
      {value:"4", name:"Evening (8:00pm to Midnight)"},
      {value:"5", name:"Latenight (Midnight to Close)"}
    ];

    $scope.initVars = function() {
      $scope.transactionFinder = {};
      $scope.transactionFinder.timeRange = {};
      $scope.transactionFinder.timeRange.name = 'Time Range';
    }
    $scope.initVars();

    var bgReceiptNumber = $filter('bgReceiptNumber');
    $scope.checkReceiptInput = function() {
      if ($scope.transactionFinder.receiptId != '') {
        $scope.transactionFinder.receiptId = bgReceiptNumber($scope.transactionFinder.receiptId);
      }
    }

    $scope.reset = function() {
      $scope.initVars();
      $scope.location.reset = true;
      $scope.locationCheck.reset = true;
    };

    $scope.findBy = function(type) {
      var postParam = '?';
      if (type == 1) {
        var cleanReceipt = ($scope.transactionFinder.receiptId != null) ? $scope.transactionFinder.receiptId.replace(/-/g,'') : '';
        postParam += 'receiptNumber=' + cleanReceipt;
      } else if (type == 2) {
        var getDate = new Date($scope.transactionFinder.dateRange);
        var setDate = $filter('convertDateYYYYMMDD');
        postParam += 'date=' + setDate(getDate);
        postParam += '&bpStoreId=' + $scope.location.storeInfo.store_id;
        postParam += '&dayPartName=' + $scope.transactionFinder.timeRange.value;
      } else {
        var getDate = new Date($scope.transactionFinder.dateRangeCheck);
        var setDate = $filter('convertDateYYYYMMDD');
        postParam += 'dateMonth=' + setDate(getDate).slice(-4);
        postParam += '&checkNumber=' + $scope.transactionFinder.checkNum;
        postParam += '&bpStoreId=' + $scope.locationCheck.storeInfo.store_id;
        postParam += '&hour=' + $scope.transactionFinder.timeHour;
        postParam += '&minute=' + $scope.transactionFinder.timeMin;
      }
      
      grmRequest.get('/receipts.json' + postParam).then(function(data){
        $rootScope.transactionFinderResults = data;
        $location.path( "/transaction-results" );
      },function(response){
        $scope.modal.msg = 'Unable to find transaction!';
      });
    }

  });

//Controller for Search results page
bpControllers.controller('transactionsResultsCtrl',
  function($scope, $route, $rootScope, $location, $filter) {
    $rootScope.containerClass = 'search-container user-container transaction-finder-container';
    $rootScope.activeTab = 'transaction-finder';

    if($rootScope.transactionFinderResults == undefined) {
      $location.path( "/transaction-finder" );
    }else{
      $scope.data = $rootScope.transactionFinderResults;
      $scope.pagination = {}
      $scope.pagination.current = 0;
      $scope.pagination.size = 20;
      $scope.pagination.obj = $scope.data;
      $scope.pagination.back = '#/transaction-finder';
    }

  });

//Team HQ Overview page.
bpControllers.controller('transactionsOverviewCtrl',
  function($scope, $route, $routeParams, $rootScope, $location, $filter, grmRequest) {
    $rootScope.containerClass = 'transaction-finder-container';
    $rootScope.activeTab = 'transaction-finder';
    $rootScope.receipt_id = $routeParams.id;

    $scope.modal = {};
    $scope.modal.msg = '';

    $scope.currentTransaction = {};
    $scope.currentTransaction.transactionRewardGuest = '';
    $scope.currentTransaction.rewardGuestResults = false;

    $scope.paginationItems = {}
    $scope.paginationItems.current = 0;
    $scope.paginationItems.size = 20;
    $scope.paginationItems.obj = {};

    $scope.paginationTeams = {}
    $scope.paginationTeams.current = 0;
    $scope.paginationTeams.size = 20;
    $scope.paginationTeams.obj = {};

    if($rootScope.transactionFinderResults == undefined) {
      $scope.processingTransaction = true;
      var postParam = '?receiptNumber=' + $rootScope.receipt_id;
      grmRequest.get('/receipts.json' + postParam).then(function(data){
        $rootScope.transactionFinderResults = data;
        $scope.data = $rootScope.transactionFinderResults[0];
        $scope.paginationItems.obj = $scope.data;
        $scope.processingTransaction = false;
      },function(response){
        $location.path( "/transaction-finder" );
      });
    }else{
      for (var transaction in $rootScope.transactionFinderResults) {
        if($rootScope.transactionFinderResults[transaction].receipt_number == $rootScope.receipt_id) {
          $scope.data = $rootScope.transactionFinderResults[transaction];
          $scope.paginationItems.obj = $scope.data;
        }
      }
    }

    $scope.rewardGuest = function() {
      var postParam = "?receiptNumber="+ $rootScope.receipt_id + "&email=" + encodeURIComponent($scope.currentTransaction.transactionRewardGuest);
      grmRequest.get('/receipts/guests.json' + postParam).then(function(data){
        $scope.currentTransaction.rewardGuestResults = true;
        $scope.currentTransaction.guestTransactions = data;
        $scope.paginationTeams.obj = data;
      },function(response){        
        $scope.modal.msg = response;
      });
    }

    $scope.backRewardGuestSearch = function() {
      $scope.currentTransaction.rewardGuestResults = false;
    }

    $scope.submitReceipt = function(obj) {
      var postData = {
        email: $scope.currentTransaction.transactionRewardGuest,
        receipt_number: $rootScope.receipt_id,
        team_id: obj.team_id
      }
      grmRequest.post('/receipts/guests.json', postData).then(function(data){
        $scope.currentTransaction.guestTransactions = data;
      },function(response){        
        $scope.modal.msg = response;
      });
    }

    $scope.cancelReceipt = function(obj) {
      var postParam = "?receiptNumber="+ $rootScope.receipt_id + "&email=" + encodeURIComponent($scope.currentTransaction.transactionRewardGuest) + "&receiptSubmissionId=" + obj.receipt_submission_id;
      grmRequest.delete('/receipts/guests.json' + postParam).then(function(data){
        $scope.currentTransaction.guestTransactions = data;
      },function(response){        
        $scope.modal.msg = response;
      });
    }

  });