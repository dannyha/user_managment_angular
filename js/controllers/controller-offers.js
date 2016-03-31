'use strict';

/* Controllers */

//Contest admin landing page
bpControllers.controller('OffersAdminCtrl', 
  function($scope, $route, $rootScope, $location, $window, grmRequest, Upload){
    $rootScope.containerClass = 'offers-admin-container';
    $rootScope.activeTab = 'offers-admin';

    $scope.uploadOfferError = false;

    grmRequest.get('/offers/').then(function(data) { 
      if(data != undefined){
        $rootScope.offers = data;
      }else{
        $rootScope.offers={};
      }
    }); 
    
    $scope.uploadOfferBox = function(id) {
      angular.forEach($rootScope.offers, function(obj) {
        if(obj.walletCode == id){
          $scope.thisWalletCode = id;
          $scope.uploadOffer = {};
          $scope.uploadOffer.language = 'EN';
          $scope.overlayType = 'uploadOffer';
          $scope.open_fancybox();
      	}
      });
    }
    
    $scope.closeBox = function() {
      $scope.uploadOfferError = false;
      $scope.viewBox = '';
      $scope.close_fancybox();
    }

    $scope.uploadPic = function (files) {

      if (files != null) {
        $scope.uploadOfferError = false;

        var file = new FormData();
        file.append('picture', files[0]);

        file.upload = Upload.http({
          url: grm_url + '/csp/offers/' + $scope.thisWalletCode + '/picture?language=' + $scope.uploadOffer.language,
          method: 'POST',
          headers: {
            'CSP-Authorization': $window.sessionStorage.getItem('token'),
            'Content-Type': undefined
          },
          data: file,
          transformRequest: function(data, headersGetterFunction) {
              return data; // do nothing! FormData is very good!
          }
        });
        
        file.upload.then(function (response) {
          $scope.uploadOfferError = false;
          $scope.close_fancybox();
        }, function (response) {
          $scope.uploadOfferError = true;
        });

      }
        
    };
    

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