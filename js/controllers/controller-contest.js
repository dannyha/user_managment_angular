'use strict';

/* Controllers */

//Contest admin landing page
bpControllers.controller('ContestAdminCtrl',
  function($scope, $route, $rootScope, $location, grmRequest) {
    $rootScope.containerClass = 'contest-admin-container';
    $rootScope.activeTab = 'contest-admin';

    $scope.pagination = {};
    $scope.pagination.current = 0;
    $scope.pagination.size = 20;
    $scope.pagination.obj = {};

    grmRequest.get('/contests.json?').then(function(data) {
      if(data.contests != undefined){
        $rootScope.contestSearchResults = data.contests
        //console.log($rootScope.contestSearchResults);
        $scope.pagination.obj = data.contests;
      }else{
      }      
    });
    
    $scope.editContestBox = function(id) {
      angular.forEach($rootScope.contestSearchResults, function(obj) {
        if(obj.contest_code == id){
    		grmRequest.get('/contests/'+id).then(function(data) {
      			if(data != undefined){ 
        			$scope.contestToEdit = data;
        			$scope.contestToEdit.originalContestCode = data.contest_code;
      			}else{
      			}      
    		});
      	}
      });
      $scope.edit = {};  
      $scope.overlayType = 'editContest';
      $scope.open_fancybox();
    }
    
    $scope.closeBox = function() {
      $scope.viewBox = '';
      //delete $scope.guestData.addresses
      $scope.close_fancybox()
    }
    
    $scope.editContest = function(){
      var editData = {
      contest_code:$scope.contestToEdit.contest_code,
      title_en:$scope.contestToEdit.title_en,
      title_fr:$scope.contestToEdit.title_fr,
      start_date:$scope.contestToEdit.start_date,
      end_date:$scope.contestToEdit.end_date,
      description_en:$scope.contestToEdit.description_en,
      description_fr:$scope.contestToEdit.description_fr,
      in_store:$scope.contestToEdit.in_store,
      online:$scope.contestToEdit.online,
      legal_en:$scope.contestToEdit.legal_en,
      legal_fr:$scope.contestToEdit.legal_fr,
      menu_item_id:$scope.contestToEdit.menu_item_id,
      banner_en:$scope.contestToEdit.banner_en,
      banner_fr:$scope.contestToEdit.banner_fr,
      banner_retina_en:$scope.contestToEdit.banner_retina_en,
      banner_retina_fr:$scope.contestToEdit.banner_retina_fr
      };      
      var hasEmptyFields = false;
      if($scope.contestToEdit.title_en == ""||$scope.contestToEdit.title_fr == ""||$scope.contestToEdit.start_date == ""||
      $scope.contestToEdit.end_date == ""||$scope.contestToEdit.description_en == ""||$scope.contestToEdit.description_fr == ""||
      $scope.contestToEdit.legal_en == ""||$scope.contestToEdit.legal_fr == ""||$scope.contestToEdit.menu_item_id == ""||
      $scope.contestToEdit.banner_en == ""||$scope.contestToEdit.banner_fr == ""||$scope.contestToEdit.banner_retina_en == ""||
      $scope.contestToEdit.banner_retina_fr == "")
      {
      	hasEmptyFields = true;
      }
      
      if(hasEmptyFields)
      {
      	$scope.contestToEdit.error="Please fulfill all the required fields.";
      	return;
      }
      
      grmRequest.post('/contests/'+$scope.contestToEdit.originalContestCode, editData).then(function(data) {
        $scope.reloadData();
        $scope.close_fancybox();
      });
    }
    
    $scope.deleteContest = function(contest_code){
      grmRequest.delete('/contests/'+contest_code).then(function(data) {
        $scope.close_fancybox();
        $scope.reloadData();
      });
    }
    
    $scope.addContestBox = function() {
      $scope.type = 'Quantity';
        $scope.allOffers = [];
        $scope.add = {};
        $scope.overlayType = 'addContest';
        $scope.add.title_en="";
  		$scope.add.title_fr="";
  		$scope.add.start_date="";
  		$scope.add.end_date="";
  		$scope.add.description_en="";
  		$scope.add.description_fr="";
  		$scope.add.in_store="";
  		$scope.add.online="";
  		$scope.add.legal_en="";
  		$scope.add.legal_fr="";
  		$scope.add.banner_en="";
 		$scope.add.banner_fr="";
  		$scope.add.banner_retina_en="";
 		$scope.add.banner_retina_fr="";
 		$scope.add.menu_item_id="";
        $scope.open_fancybox();  
    }
    
    $scope.addContest = function(){
      var addData = {
  		title_en:$scope.add.title_en,
  		title_fr:$scope.add.title_fr,
  		start_date:$scope.add.start_date,
  		end_date:$scope.add.end_date,
  		description_en:$scope.add.description_en,
  		description_fr:$scope.add.description_fr,
  		in_store:$scope.add.in_store,
  		online:$scope.add.online,
  		legal_en:$scope.add.legal_en,
  		legal_fr:$scope.add.legal_fr,
  		banner_en:$scope.add.banner_en,
 		banner_fr:$scope.add.banner_fr,
  		banner_retina_en:$scope.add.banner_retina_en,
 		banner_retina_fr:$scope.add.banner_retina_fr,
 		menu_item_id:$scope.add.menu_item_id
 	  };
       	  
 	  var hasEmptyFields = false;
      if($scope.add.title_en == ""||$scope.add.title_fr == ""||$scope.add.start_date == ""||
      $scope.add.end_date == ""||$scope.add.description_en == ""||$scope.add.description_fr == ""||
      $scope.add.legal_en == ""||$scope.add.legal_fr == ""||$scope.add.menu_item_id == ""||
      $scope.add.banner_en == ""||$scope.add.banner_fr == ""||$scope.add.banner_retina_en == ""||$scope.add.banner_retina_fr == "")
      {
      	hasEmptyFields = true;
      }
      if(hasEmptyFields)
      {
      	$scope.add.error="Please fulfill all the required fields.";
      	return;
      }
      
      grmRequest.post('/contests/', addData).then(function(data) {
        $scope.reloadData();
        $scope.close_fancybox();
      }, function(error) {
          $scope.add.error = error;
        });
    }
    
    $scope.reloadData = function(){
      grmRequest.get('/contests').then(function(data) {
      if(data.contests != undefined){
        $rootScope.contestSearchResults = data.contests
        //console.log($rootScope.contestSearchResults);
      }else{
      	$rootScope.contestSearchResults={};
      }      
    });
    }
    
});