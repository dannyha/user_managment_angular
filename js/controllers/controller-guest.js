'use strict';

/* Controllers */

//controller for search page
bpControllers.controller('GuestSearchCtrl',
  function($scope, $route, $rootScope, $location, grmRequest) {
    $rootScope.containerClass = 'search-container user-container';
    $rootScope.activeTab = 'guest-admin';

    //Save search
    if($rootScope.saveGuestSearch){
      $scope.guestSearch = $rootScope.saveGuestSearch;
    }else{
      $scope.guestSearch = {}
      $scope.guestSearch.numberOfGuests = -1
    }
    
    $scope.findGuest = function() {
      $rootScope.saveGuestSearch = $scope.guestSearch;
      //console.log($.param($scope.guestSearch));
      var searchParams = $.param($scope.guestSearch);
      
      grmRequest.get('/guests.json?' + searchParams).then(function(data) {
        if(data.guests != undefined){
          $rootScope.guestSearchResults = data

          $location.path( "/guest-results" );
        }else{
          $scope.open_fancybox()
        }
      });
      //$scope.hideForm = true;     
    };
    $scope.newGuest = function() {
      //$scope.hideForm = true;
      $location.path( "/guest-new" );
    };
    $scope.reset = function() {
      $scope.guestSearch = {};
      $scope.guestSearch.email = '';
      $scope.guestSearch.numberOfGuests = -1;
    };
  });

//Controller for Search results page
bpControllers.controller('GuestResultsCtrl',
  function($scope, $route, $rootScope, $location, $filter) {
    $rootScope.containerClass = 'search-container user-container';
    $rootScope.activeTab = 'guest-admin';
    var orderBy = $filter('orderBy');
        
    if($rootScope.guestSearchResults == undefined) {
      $location.path( "/guest-admin" );
    }else{
      $scope.currentPage = 0;
      $scope.pageSize = 20;
      $scope.data = $rootScope.guestSearchResults.guests;
      $scope.numberOfPages = function(){
        return Math.ceil($scope.data.length/$scope.pageSize);                
      }
      $scope.order = function(predicate, reverse) {
        $scope.data = orderBy($scope.data, predicate, reverse);
      };
      //$scope.order('-email', false);
    }
  });

//Controller for the new Guest creation.
bpControllers.controller('GuestNewCtrl',
  function($scope, $route, $rootScope, $location, grmRequest) {
    $rootScope.containerClass = 'user-container edit-container';
    $rootScope.activeTab = 'guest-admin';
    $scope.newGuestForm;
    $scope.guestData = {};
    $scope.address = {};
    $scope.addressBtn = 'Add Address';
    $scope.cityList = {};
    $scope.cList = [];
    $scope.cLoc = [];
    $scope.mybp = {};
    $scope.province = 'Province';
    $scope.city = 'City';
    $scope.locations = 'Location';
    $scope.guestData.language = 'Select';
    $scope.langValue = null;
    $scope.genderValue = null;
    $scope.ageRangeValue = null;
  
    $scope.changeProvince = function() {
      if($scope.mybp.province != null){
        $scope.province = $scope.mybp.province.n;
        var param = '?province=' + $scope.mybp.province.v
        $scope.cList = [];
        $scope.cLoc = [];
        $scope.city = 'City';
        $scope.locations = 'Location';
        grmRequest.get('/stores.json' + param).then(function(data){
          $scope.cityList = data;
          angular.forEach($scope.cityList, function(obj) {
            if($scope.cList.indexOf(obj.city) === -1){
              $scope.cList.push(obj.city);  
            }          
          });
        });  
      }
    }

    $scope.changeCity = function() {
      $scope.cLoc = [];
      $scope.locations = 'Location';
      $scope.city = $scope.mybp.city;
      $scope.theLocations = {}
      angular.forEach($scope.cityList, function(obj) {
        if(obj.city == $scope.city){
          $scope.cLoc.push(obj);
        }
      });
    }

    $scope.changeLocations = function() {
      angular.forEach($scope.cLoc, function(obj) {
        if(obj.store_id == $scope.guestData.store_id){
          $scope.locations = obj.name;
        }
      });
    }


   $scope.changeLanguage = function() {
      if($scope.guestData.language != null){
        $scope.langValue = $scope.guestData.language.v;
        $scope.guestData.language = $scope.guestData.language.n;
      } else {
        $scope.guestData.language = 'Select';
      }
    }
    
   $scope.changeAgeRange = function() {
      if($scope.guestData.age_range != null){
        $scope.ageRangeValue = $scope.guestData.age_range.v;
        $scope.guestData.age_range = $scope.guestData.age_range.n;
      } else {
        $scope.guestData.age_range = 'Select';
      }
    }
      
   $scope.changeGender = function() {
      if($scope.guestData.gender != null){
        $scope.genderValue = $scope.guestData.gender.v;
        $scope.guestData.gender = $scope.guestData.gender.n;
      } else {
        $scope.guestData.gender = 'Select';
      }
    }

    $scope.newGuest = function() {
      if($scope.newGuestForm.$valid){
        $scope.guestData.mode = 'normal';
        if($scope.guestData.store_id == undefined) {
          $scope.guestData.store_id = '888';  
        }
        if($scope.birthday) {
          $scope.guestData.birthday = '2000-' + $scope.birthday;
        }
        $scope.guestData.language = $scope.langValue;
        $scope.guestData.gender = $scope.genderValue;
        $scope.guestData.age_range = $scope.ageRangeValue;
        grmRequest.post('/guests.json', $scope.guestData).then(function(data){
          $scope.viewBox = 'confirm';
          $scope.confirmationMsg = "Guest Account Created"
          $scope.open_fancybox();
        },function(response){
          $scope.serverReply = response
        });  
      }
    };

    $scope.addAddresses = function() {
      $scope.viewBox = 'address';
      $scope.open_fancybox();
    }

    $scope.addressAdder = function() {
      $scope.address = $scope.address;
      $scope.address.country = 'CA';
      $scope.guestData.addresses = []
      $scope.guestData.addresses.push($scope.address);
      $scope.addressBtn = 'Edit Address';
      $scope.close_fancybox()
    }

    $scope.closeBox = function() {
      $scope.viewBox = '';
      //delete $scope.guestData.addresses
      $scope.close_fancybox()
    }

    $scope.close = function() {
      $location.path( "/guest-admin" );
      $scope.close_fancybox();
    }

    $scope.reset = function() {
      $scope.guestData = {}         // resets user data
      $scope.address = {}           // resets address data
      $scope.guestData.email = '';  // resets invalid email
      $scope.province = 'Province'; // resets myBP location
      $scope.mybp.province = null   // resets myBP location
      $scope.birthday = '';
      $scope.guestData.language = null;
    };
  });

//Guest details page.
bpControllers.controller('GuestDetailsCtrl',
  function($scope, $route, $routeParams, $rootScope, $location, $filter, grmRequest) {
    $rootScope.containerClass = 'user-container guest-details-container';
    $rootScope.activeTab = 'guest-admin';
    $rootScope.subNav = 'guest-details';
    $scope.editGuestForm;
    $scope.cityList = {};
    $scope.cList = [];
    $scope.cLoc = [];
    $scope.mybp = {};
    $scope.province = 'Provinces';
    $scope.city = 'City';
    $scope.locations = 'Location';
    $scope.guestInfo = {}
    $scope.guest_id = $routeParams.id
    $scope.paytronix_error = null;
    $scope.langValue = null;
    $scope.genderValue = null;
    $scope.ageRangeValue = null;

    //overlay to confirm screens
    $scope.confirmBox = function(msg) {
      $scope.confirmation = msg;
      $scope.viewBox = 'confirm';
      $scope.open_fancybox();
    }

    //reload to update the content on the page.
    $scope.reloadGuest = function() {
      //load guest details
      grmRequest.get('/guests/' + $routeParams.id + '.json').then(function(data) {
        $rootScope.currentGuestInfo = data; // set rootscope var for guest info for use on other pages. 

        console.log($rootScope.currentGuestInfo);

        angular.forEach(data, function(value, key) {
          if(key == 'store_id'){
            if(value != '888'){
              var param = '?storeId=' + value
              grmRequest.get('/stores.json' + param).then(function(data) {
                $scope.storeInfo = data[0];
              });
            }else{
              $scope.mybp.store_id = '888'
            }
          }else if(key == 'addresses') {
            $scope.addresses = value; 
          }else if(key == 'mobile_number') {
            $scope.guestInfo['phone_number'] = value; 
          }else if(key == 'birthday') {
            $scope.birthday = value.slice(5); 
          }else if(key == 'language') {
            for (var lang in $scope.languages) {
              if ($scope.languages[lang].v == value) {
                $scope.langValue = $scope.languages[lang];
                $scope.guestInfo['language'] = $scope.languages[lang].v;
              }
            }
          }else if(key == 'gender') {
            for (var lang in $scope.genders) {
              if ($scope.genders[lang].v == value) {
                $scope.genderValue = $scope.genders[lang];
                $scope.guestInfo['gender'] = $scope.genders[lang].v;
              }
            }
          }else if(key == 'age_range') {
            for (var lang in $scope.ageRanges) {
              if ($scope.ageRanges[lang].v == value) {
                $scope.ageRangeValue = $scope.ageRanges[lang];
                $scope.guestInfo['age_range'] = $scope.ageRanges[lang].v;
              }
            }
          }else if(key == 'paytronix_id') {
            $scope.guestInfo['paytronix_id'] = value; 
          }else if(['first_name', 'last_name', 'email'].indexOf(key) > -1) {
            $scope.guestInfo[key] = value; 
          }
        });
      });
    }

    $scope.reloadGuest();


    //Pagination for all the lists in thie controller
    $scope.pagenation = function(list, perPage, sort) {
      if(list == undefined) {
        //$location.path( "/guest-admin" );
      }else{
        $scope.currentPage = 0;
        $scope.pageSize = perPage;
        $scope.numberOfPages = function(list){
          return Math.ceil(list.length/$scope.pageSize);                
        }
        /* order commented out for now.
        var orderBy = $filter('orderBy');
        $scope.order = function(predicate, reverse) {
          list = orderBy(list, predicate, reverse);
        };
        if(sort != undefined){
          $scope.order(sort, false);
        }*/
        return list;
      }
    }

    $scope.unlinkSocial = function() {
      grmRequest.delete('/guests/' + $routeParams.id + '/social.json').then(function(response){
        $scope.confirmBox('Facebook unlinked.');
        $scope.reloadGuest();
      }, function(response){
        $scope.confirmBox(response);
      });
    }

    $scope.editGuest = function() {
      if($scope.editGuestForm.$valid) {
        if($scope.birthday) {
          $scope.guestInfo.birthday = '2000-' + $scope.birthday;  
        }
        grmRequest.post('/guests/' + $routeParams.id + '.json', $scope.guestInfo).then(function(response){
          $scope.serverError = '';
          $scope.confirmBox('Guest Information updated');
        }, function(response){
          $scope.serverError = response;
        });  
      }
    }

    $scope.changeProvince = function() {
      $scope.province = $scope.mybp.province.n;
      var param = '?province=' + $scope.mybp.province.v
      $scope.cList = [];
      $scope.cLoc = [];
      $scope.city = 'City';
      $scope.locations = 'Location';
      grmRequest.get('/stores.json' + param).then(function(data){
        $scope.cityList = data;
        angular.forEach($scope.cityList, function(obj) {
          if($scope.cList.indexOf(obj.city) === -1){
            $scope.cList.push(obj.city);  
          }          
        });
      });
    }

    $scope.changeCity = function() {
      $scope.cLoc = [];
      $scope.locations = 'Location';
      $scope.city = $scope.mybp.city;
      $scope.theLocations = {}
      angular.forEach($scope.cityList, function(obj) {
        if(obj.city == $scope.city){
          $scope.cLoc.push(obj);
        }
      });
    }

    $scope.changeLocations = function() {
      angular.forEach($scope.cLoc, function(obj) {
        if(obj.store_id == $scope.guestInfo.store_id){
          var param = '?storeId=' + $scope.guestInfo.store_id
          grmRequest.get('/stores.json' + param).then(function(data) {
            $scope.locations = obj.name;
            $scope.storeInfo = data[0];
          });
        }
      });
    }

   $scope.changeLanguage = function() {
      if($scope.langValue != null){
        $scope.guestInfo.language = $scope.langValue.v;
      }
   }
   
   $scope.changeGender = function() {
      if($scope.genderValue != null){
        $scope.guestInfo.gender = $scope.genderValue.v;
      }
   }
      
   $scope.changeAgeRange = function() {
      if($scope.ageRangeValue != null){
        $scope.guestInfo.age_range = $scope.ageRangeValue.v;
      }
   }

    $scope.registerPaytronix = function() {
      grmRequest.post('/guests/' + $routeParams.id + '/paytronix.json').then(function(data) {
        $scope.guestInfo['paytronix_id'] = data.paytronix_id;
      },function(error){
        if (error.message == "There was an error registering user to Paytronix.") {
          $scope.paytronix_error = "The request to register the guest with Paytronix failed, it appears that there is an account in Paytronix with that email.  Please login to the Paytronix portal and retrieve the Paytronix id for this email and update this guest.";
        } else {
          $scope.paytronix_error = "The request to register the guest with Paytronix failed, unable to reach Paytronix, please try again later.";
        }
      });
    }



  //Overlay for acount changes.
    $scope.historyBox = function() {
      grmRequest.get('/guests/'+ $routeParams.id +'/changes.json').then(function(data) {
        $scope.historyData = data.csp_guest_changes;
        $scope.historyData = $scope.pagenation($scope.historyData, 4, '-date');
        if(data.addresses_changes_histories[0]){
          $scope.addressHistoryData = [];
          data.addresses_changes_histories.reverse()
          angular.forEach(data.addresses_changes_histories, function(obj){
            angular.forEach(obj.cspGuestAddressesChanges, function(obj){
              $scope.addressHistoryData.push(obj);
            });  
          })
          $scope.addressHistoryData = $scope.pagenation($scope.addressHistoryData, 4, '-date');  
        }
        $scope.viewBox = 'history';
        $scope.open_fancybox();

      }); 
    }

    $scope.addAddresses = function() {
      $scope.viewBox = 'address';
      $scope.open_fancybox();
      $scope.theAddress = {}
    }

    $scope.addressAdder = function() {
      $scope.theAddress.country = 'CA';
      if($scope.editID != undefined){
        var call = '/guests/' + $routeParams.id + '/addresses/' + $scope.editID + '.json';  
      }else{
        var call = '/guests/' + $routeParams.id + '/addresses.json';  
      }
      
      grmRequest.post(call, $scope.theAddress).then(function(data) {
        $scope.reloadGuest();
        $scope.closeBox();
      },function(response){
        $scope.serverReply = response
      });
      //
    }

    $scope.passwordReset = function() {
      var call = '/guests/' + $routeParams.id + '/passwordReset.json';
      grmRequest.post(call).then(function(data) {
        $scope.confirmBox('Guest Password was reset');
      });
    }    

    $scope.removeAddress = function(id) {
      var call = '/guests/' + $routeParams.id + '/addresses/' + id + '.json';
      grmRequest.delete(call).then(function(data) {
        $route.reload();
      });
    }

    $scope.editAddress = function(id) {
      $scope.theAddress = {};
      $scope.editID = id;
      angular.forEach($scope.addresses, function(obj) {
        if(obj.address_id == id){
          angular.forEach(obj, function(prepop, key) {
            $scope.theAddress[key] = prepop;
          });
          $scope.viewBox = 'address';
          $scope.open_fancybox()
        }
      });
    }

    $scope.closeBox = function() {
      $scope.viewBox = '';
      delete $scope.editID;
      $scope.serverReply = '';
      $scope.close_fancybox()
    }

    $scope.backBtn = function() {
      $location.path( "/guest-results" );
    }

  });

//Guest order history tab
bpControllers.controller('GuestOrderHistoryCtrl',
  function($scope, $route, $routeParams, $rootScope, grmRequest) {
    $scope.$route = $route;
    $rootScope.containerClass = 'user-container guest-details-container';
    $rootScope.activeTab = 'guest-admin';
    $rootScope.subNav = 'guest-order-history';
    $scope.guest_id = $routeParams.id;


    if($rootScope.currentGuestInfo == undefined){
      var call = '/guests/' + $routeParams.id + '.json';
      grmRequest.get(call).then(function(data) {
        $scope.guestInfo = data;
        $scope.defaultEmail = $scope.guestInfo.email;
      })
    }else{
      $scope.guestInfo = $rootScope.currentGuestInfo;
      $scope.defaultEmail = $scope.guestInfo.email;
    }

    
    grmRequest.get('/guests/' + $scope.guest_id +' /orders.json').then(function(data) {
      $scope.orderInfo = data

      $scope.currentPage = 0;
      $scope.pageSize = 15;
      
      $scope.numberOfPages = function(){
        return Math.ceil($scope.orderInfo.length/$scope.pageSize);                
      }
      $scope.order = function(predicate) {
        $scope.orderInfo = orderBy($scope.orderInfo, predicate, reverse);
      };
    });

    $scope.orderDetails = function(orderId,orderNumber) {
      $scope.receiptEmailError = '';
      $scope.receiptEmailResponse = ''
      var call = '/guests/' + $scope.guest_id +' /orders/' + orderId + '.json';
      grmRequest.get(call).then(function(data) {
        $scope.clickedOrder = {};
        $scope.details = data;
        angular.forEach($scope.details, function(obj) {
        	obj.order_number = orderNumber;
        	$scope.clickedOrder.order_number = orderNumber;
        });
        $scope.open_fancybox();
      })
    }
    
    $scope.sendReceiptEmail = function(orderNumber,email) {
    $scope.receiptEmailPayload = {};
    $scope.receiptEmailPayload.email = email;
    $scope.receiptEmailPayload.order_number = orderNumber;
    
    $scope.receiptEmailResponse = '';
    $scope.receiptEmailError = '';
    grmRequest.post('/guests/receipts',$scope.receiptEmailPayload).then(function(response) {
         $scope.receiptEmailResponse = response.message;
      }, function(error) {
         $scope.receiptEmailError = "There was an error sending the receipt email";
      });
    }

    $scope.resetAndClose = function() {
      $scope.close_fancybox();
      $scope.guestInfo.email = $scope.defaultEmail;
    }

  });

//Guest offer tab
bpControllers.controller('GuestOffersCtrl',
  function($scope, $route, $routeParams, $rootScope, $location, $filter, grmRequest) {
    $scope.$route = $route;
    $rootScope.containerClass = 'user-container guest-details-container';
    $rootScope.activeTab = 'guest-admin';
    $rootScope.subNav = 'guest-offers';
    $scope.guest_id = $routeParams.id //used by the subnav

    if($rootScope.currentGuestInfo == undefined){
      grmRequest.get('/guests/' + $routeParams.id + '.json').then(function(data) {
        $rootScope.currentGuestInfo = data;
        $scope.guestInfo = data;
      })
    }else{
      $scope.guestInfo = $rootScope.currentGuestInfo
    }
    $scope.reloadData = function(){
      grmRequest.get('/guests/'+ $routeParams.id +'/offers.json').then(function(data) {
        $scope.guestOffers = data;
        angular.forEach($scope.guestOffers, function(obj) {
          if(obj.inStore && obj.online) {
            obj.availability = 'In-Store & Online'
          }else if(obj.inStore) {
            obj.availability = 'In-Store'
          }else if(obj.online) {
            obj.availability = 'Online'
          }
        });
        var orderBy = $filter('orderBy');
        $scope.order = function(predicate, reverse) {
          $scope.guestOffers = orderBy($scope.guestOffers, predicate, reverse);
        }
        $scope.order('offerEndDate', false);
        
        grmRequest.get('/guests/'+ $routeParams.id +'/contests.json').then(function(data) {
        $scope.guestContests = data;
        angular.forEach($scope.guestContests, function(obj) {
          if(obj.title_fr)
          {
            obj.title = obj.title_fr;
          }
          else
          {
            obj.title = obj.title_en;
          }
          if(obj.description_fr)
          {
            obj.description = obj.description_fr;
          }
          else
          {
            obj.description = obj.description_en;
          }
          if(obj.in_store && obj.online) {
            obj.availability = 'In-Store & Online'
          }else if(obj.in_store) {
            obj.availability = 'In-Store'
          }else if(obj.online) {
            obj.availability = 'Online'
          }
        });
      });  
      });
    }
    
    $scope.reloadData();

    //Pacenation for all the lists in thie controller
    $scope.pagenation = function(list, perPage, sort) {
      if(list == undefined) {
        //$location.path( "/guest-admin" );
      }else{
        $scope.currentPage = 0;
        $scope.pageSize = perPage;
        $scope.numberOfPages = function(list){
          return Math.ceil(list.length/$scope.pageSize);                
        }
        /* order commented out for now.
        var orderBy = $filter('orderBy');
        $scope.order = function(predicate, reverse) {
          list = orderBy(list, predicate, reverse);
        };
        if(sort != undefined){
          $scope.order(sort, false);
        }*/
        return list;
      }
    }

    $scope.historyBox = function() {
      $scope.heading = '';
      
      grmRequest.get('/guests/'+ $routeParams.id +'/offerhistory.json').then(function(data) {
        $scope.offerHistory = data;
        if($scope.offerHistory.length > 0) {
          $scope.offerHistory = $scope.pagenation($scope.offerHistory, 10, '-date');
        }
        grmRequest.get('/guests/'+$routeParams.id +'/contests/history.json').then(function(data) {       
          angular.forEach(data, function(value, index) {
              var endDate = new Date(value.end_date);                          
              value.transaction_date=endDate.toString('yyyy-MM-dd');
              value.store_location="Contest";
              if(value.title_fr)
          	  {
            	value.offer_name = value.title_fr;
              }
              else
              {
            	value.offer_name = value.title_en;
          	  }
              value.transaction="1";
              var currentTimeStamp = new Date().getTime();
              if(currentTimeStamp>value.end_date)
              {
                value.action="Expired";
              }
              else
              {
                value.action="Active";
              }
              
              $scope.offerHistory.push(value);
          });
        });
        $scope.overlayType = 'offerHistory'
        $scope.open_fancybox();
      });
    }

    $scope.addOfferBox = function() {
      $scope.type = 'Quantity'
      grmRequest.get('/offers.json').then(function(data) {
        $scope.allOffers = []
        angular.forEach(data, function(value, index) {
          if([0, 1, 3].indexOf(index) == -1){ //filtering invalid offers from the list. Hopefully will be fixed later.
            $scope.allOffers.push({'wallet': value.walletCode, 'title': value.offerTitle})
          }
        });
        $scope.add = {}
        $scope.overlayType = 'addOffer'
        $scope.open_fancybox();
      });      
    }
    
    $scope.addContestBox = function() {
      $scope.type = 'Quantity'
      grmRequest.get('/contests.json').then(function(data) {
        $scope.allContests = [];
        angular.forEach(data.contests, function(value, index) {
		  var datePattern = /\d*-\d*-\d*/.exec(value.end_date);
          var timePattern = /\d*:\d*:\d*/.exec(value.end_date);
          var endDateTimeStamp = Date.parse(datePattern[0] + ' ' + timePattern[0]).getTime();
          var currentTimeStamp = new Date().getTime();
          if(currentTimeStamp<endDateTimeStamp)
          {
          	$scope.allContests.push({'contest': value.contest_code, 'title': value.title_en});
          }
        });

        $scope.add = {}
        $scope.overlayType = 'addContest'
        $scope.open_fancybox();
      });      
    }

    $scope.editOfferBox = function(id) {
      angular.forEach($scope.guestOffers, function(obj) {
        if(obj.walletCode == id){
          $scope.rewardToEdit = obj
        }
      });
      $scope.edit = {}
      $scope.edit.balance = $scope.rewardToEdit.offerBalance
      $scope.overlayType = 'editOffer'
      $scope.open_fancybox();
    }

    $scope.deleteGuestContest = function(id) {
      angular.forEach($scope.guestContests, function(obj) {
        if(obj.id == id){
          $scope.contestToDelete = obj
          grmRequest.delete('/guests/'+$routeParams.id +'/contests/'+$scope.contestToDelete.contest_code+'/'+$scope.contestToDelete.id).then(function(data) {
          $scope.reloadData();
      });
        }
      });
    }
    
    $scope.addChange = function() {
      $scope.add.error = ''
      if($scope.add.offer == 10){
        $scope.type = 'Currency'
      }else{
        $scope.type = 'Quantity'
      }
    }

    $scope.addOffer = function() {
      parseFloat($scope.add.quantity)
      if(!$scope.add.quantity){
        $scope.add.quantity = 1
      }
      grmRequest.post('/guests/' + $routeParams.id + '/offers/' + $scope.add.offer + '.json?quantity=' + $scope.add.quantity).then(function(data) {
          if($scope.add.offer == 8)
      	  {
			grmRequest.get('/guests/' + $routeParams.id + '/orderreward?offer=fifth&flag=true').then(function(data) {
        	});
      	  }
          if($scope.add.offer == 9)
      	  {
			grmRequest.get('/guests/' + $routeParams.id + '/orderreward?offer=tenth&flag=true').then(function(data) {
        	});
      	  }
        $scope.reloadData()
        $scope.close_fancybox();
      }, function(error) {
        $scope.add.error = error
      });
    }


    $scope.addContest = function() {
      parseFloat($scope.add.quantity);
      if(!$scope.add.quantity){
        $scope.add.quantity = 1
      }
      grmRequest.post('/guests/' + $routeParams.id + '/contests/' + $scope.add.contest + '.json?quantity=' + $scope.add.quantity).then(function(data) {
        $scope.reloadData();
        $scope.close_fancybox();
      }, function(error) {
        $scope.add.error = error
      });
    }
    
    $scope.editOffer = function(){
      var newBalance = parseFloat($scope.edit.balance),
          oldBalance = $scope.rewardToEdit.offerBalance,
          diff = 0
      if(newBalance > oldBalance) { //adding an offer
        diff = newBalance - oldBalance
        grmRequest.post('/guests/' + $routeParams.id + '/offers/' + $scope.rewardToEdit.walletCode + '.json?quantity='+ diff).then(function(data) {
          if($scope.rewardToEdit.walletCode == 8)
      	  {
			grmRequest.get('/guests/' + $routeParams.id + '/orderreward?offer=fifth&flag=true').then(function(data) {
        	});
      	  }
          if($scope.rewardToEdit.walletCode == 9)
      	  {
			grmRequest.get('/guests/' + $routeParams.id + '/orderreward?offer=tenth&flag=true').then(function(data) {
        	});
      	  }
  		  $scope.reloadData()
          $scope.close_fancybox();
        }, function(error) {
          $scope.edit.error = error
        });
      }else if(newBalance < oldBalance) { //Removing an offer
        if(newBalance >= 0){
          diff = oldBalance - newBalance
          grmRequest.delete('/guests/' + $routeParams.id + '/offers/' + $scope.rewardToEdit.walletCode + '.json?quantity='+ diff).then(function(data) {
            $scope.reloadData()
            $scope.close_fancybox();
          }, function(error) {
            $scope.edit.error = error
          })
        }else{ //
          $scope.edit.error = 'Quantity cannot be less than 0'
        }

      }else {
        $scope.edit.error = 'Value was not changed.'
      }
    }

    $scope.closeBox = function(){
      $scope.overlayType = '';
      $scope.close_fancybox()
    }
    
  });

//Guest Preferences tab
bpControllers.controller('GuestPreferencesCtrl',
  function($scope, $route, $routeParams, $rootScope, $location, grmRequest) {
    $scope.$route = $route;
    $rootScope.containerClass = 'user-container guest-details-container';
    $rootScope.activeTab = 'guest-admin';
    $rootScope.subNav = 'guest-communication-preferences';
    $scope.guest_id = $routeParams.id;
    
    grmRequest.get('/guests/' + $routeParams.id + '.json').then(function(data) {
      $scope.guestInfo = data;
      
      //if Communication Preferences are not set
      if($scope.guestInfo.communication_preference == null){
        $scope.guestInfo.communication_preference = {}
        $scope.guestInfo.communication_preference.sports = []
        $scope.guestInfo.communication_preference.interests = []
      }
      $scope.optionLists()
      $scope.communicationOptions.channel_email = $scope.guestInfo.communication_preference.channel_email
    });

    $scope.checkBox = function(obj, group) {
      if(group == 'sports') {
        if(obj.status){
          $scope.communicationOptions.sports.push(obj.name);
        }else{
          var index = $scope.communicationOptions.sports.indexOf(obj.name);
          $scope.communicationOptions.sports.splice(index, 1);
        }
      }else{
        if(obj.status){
          $scope.communicationOptions.interests.push(obj.name);
        }else{
          var index = $scope.communicationOptions.interests.indexOf(obj.name);
          $scope.communicationOptions.interests.splice(index, 1);
        }
      }
    }    

    $scope.optionLists = function() {
      $scope.communicationOptions = {} 
      $scope.communicationOptions.sports = []
      $scope.communicationOptions.interests = []

      grmRequest.get("/communication/sports.json").then(function(data) {
        $scope.sports = $scope.populatePrefs(data, $scope.guestInfo.communication_preference.sports);
        angular.forEach($scope.guestInfo.communication_preference.sports, function(obj){
          $scope.communicationOptions.sports.push(obj);
        });
      });

      grmRequest.get("/communication/interests.json").then(function(data) {
        $scope.interests = $scope.populatePrefs(data, $scope.guestInfo.communication_preference.interests);
        angular.forEach($scope.guestInfo.communication_preference.interests, function(obj){
          $scope.communicationOptions.interests.push(obj);
        });
      });
    }

    $scope.populatePrefs = function(list, options) {
      $scope.fullList = {}
      //If list is is empty
      if(options.length == 0) {
        angular.forEach(list, function(item, key){
          $scope.fullList[key] = {'name': item, status:false}
        });
      }else{
        angular.forEach(list, function(item, key) {
          if(options.indexOf(item) != -1){
            $scope.fullList[key] = {'name': item, status:true}
          }else{
            $scope.fullList[key] = {'name': item, status:false}
          }
        });
      }
      return $scope.fullList;
    
    }

    $scope.preferences = function() {
      grmRequest.post('/guests/'+ $scope.guest_id +'/communication.json', $scope.communicationOptions).then(function(response) {
        $scope.open_fancybox();
      }, function(response) {
      });
    }

    $scope.backBtn = function() {
      $location.path( "/guest-results" );
    }

  });

//Guest Activity tab
bpControllers.controller('GuestActivityCtrl',
  function($scope, $route, $routeParams, $rootScope, grmRequest) {
    $scope.$route = $route;
    $rootScope.containerClass = 'user-container guest-details-container';
    $rootScope.activeTab = 'guest-admin';
    $rootScope.subNav = 'guest-activity-statistics';
    $scope.guest_id = $routeParams.id

    grmRequest.get('/guests/' + $routeParams.id + '.json').then(function(data) {
      $scope.guestInfo = data;
      $scope.months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      
      grmRequest.get('/guests/' + $routeParams.id + '/transactions.json').then(function(data){
        $scope.chartData = data;
        if($scope.chartData.transactions.length > 0){
          var labelData = [], transationData = [], spentData = [];
          angular.forEach($scope.chartData.transactions, function(obj) {
            //set the chart values from the end point.
            labelData.push($scope.months[obj.month - 1] + ' ' + obj.year);
            transationData.push(obj.numberOfOrders);
            spentData.push(obj.totalAmount);
          });
          //draw charts
          $scope.chart('TRANSACTIONS IN THE PAST YEAR', 'Ordered', '#chart1', '#cc092f', labelData, transationData, 'Total Amount spent');
          $scope.chart('SPEND IN THE PAST YEAR', 'Spent', '#chart2', '#0039a6', labelData, spentData, 'Number of Transactions', '$');
        }
        
      });
    });

  /*High Chart for this year*/
    $scope.chart = function(title, seriesName, elm, lineColor, labels, rawData, yLabel, prefix) {
      if(!prefix) {
        prefix = ''
      }

      angular.element(elm).highcharts({
        title: { text: title, x: 0 }, //center
        xAxis: { categories: labels},
        yAxis: {
          title: { text: yLabel },
          min: 0,
          plotLines: [{ value: 0, width: 1, color: '#808080' }]
        },
        tooltip: { valuePrefix: prefix },
        legend: { layout: 'vertical', align: 'right', verticalAlign: 'middle', borderWidth: 0 },
        series: [{ name: seriesName, data: rawData, color: lineColor}]
      });
    }

  });


//Guest Emails
bpControllers.controller('GuestEmailsCtrl',
  function($scope, $route, $routeParams, $rootScope, grmRequest) {
    $scope.$route = $route;
    $rootScope.containerClass = 'user-container guest-details-container';
    $rootScope.activeTab = 'guest-admin';
    $rootScope.subNav = 'guest-emails';
    $scope.guest_id = $routeParams.id

    //overlay to ppen confirm screens
    $scope.confirmBox = function(msg) {
      $scope.confirmation = msg;
      $scope.viewBox = 'confirm';
      $scope.open_fancybox();
    }

    //overlay to  close confirm screens
    $scope.closeBox = function() {
      $scope.viewBox = '';
      $scope.close_fancybox()
    }

    $scope.email_welcome = function() {
      grmRequest.post('/guests/' + $routeParams.id + '/email/welcome.json').then(function(data) {
        $scope.confirmBox('Welcome email sent.');
      }, function(data) {
        $scope.confirmBox('Welcome email failed.');
      });
    }

    $scope.email_birthday = function() {
      grmRequest.post('/guests/' + $routeParams.id + '/email/birthday.json').then(function(data) {
        $scope.confirmBox('Birthday email sent.');
      }, function(data) {
        $scope.confirmBox('Birthday email failed.');
      });
    }

    $scope.email_birthdayReminder = function() {
      grmRequest.post('/guests/' + $routeParams.id + '/email/birthdayReminder.json').then(function(data) {
        $scope.confirmBox('Birthday reminder email sent.');
      }, function(data) {
        $scope.confirmBox('Birthday reminder email failed.');
      });
    }

    $scope.email_anniversary = function() {
      grmRequest.post('/guests/' + $routeParams.id + '/email/anniversary.json').then(function(data) {
        $scope.confirmBox('Anniversary email sent.');
      }, function(data) {
        $scope.confirmBox('Anniversary email failed.');
      });
    }

    $scope.email_inactive = function() {
      grmRequest.post('/guests/' + $routeParams.id + '/email/inactive.json').then(function(data) {
        $scope.confirmBox('Inactive email sent.');
      }, function(data) {
        $scope.confirmBox('Inactive email failed.');
      });
    }

    $scope.email_orderReminder = function() {
        grmRequest.post('/guests/' + $routeParams.id + '/email/orderReminder.json').then(function(data) {
          $scope.confirmBox('Order reminder email sent.');
        }, function(data) {
          $scope.confirmBox('Order reminder email failed.');
        });
      }

  });


//Guest offer tab
bpControllers.controller('GuestUnlockSpecialOffersCtrl',
  function($scope, $route, $routeParams, $rootScope, $location, $filter, grmRequest) {
    $scope.$route = $route;
    $rootScope.containerClass = 'user-container guest-details-container';
    $rootScope.activeTab = 'guest-unlock-special-offers';
    $rootScope.subNav = 'guest-unlock-special-offers';
    $scope.guest_id = $routeParams.id //used by the subnav
    $scope.coupon = {};
    $scope.coupon.receipt = {};
    $scope.coupon.offer = {};
    $scope.coupon.kidCard = {};
    $scope.hideOffer = {};
    $scope.submitError = {};
    $scope.submitError.receipt = {};
    $scope.submitError.receipt.invalid = true;
    $scope.submitError.receipt.used = true;
    $scope.submitError.receipt.none = true;
    $scope.submitError.receipt.success = true;
    $scope.submitError.offer = {};
    $scope.submitError.offer.invalid = true;
    $scope.submitError.offer.used = true;
    $scope.submitError.offer.none = true;
    $scope.submitError.offer.success = true;
    $scope.submitError.kidCard = {};
    $scope.submitError.kidCard.invalid = true;
    $scope.submitError.kidCard.used = true;
    $scope.submitError.kidCard.paytronix = true;
    $scope.submitError.kidCard.success = true;

    $scope.submitCoupon = function(type) {
      $scope.coupon[type].code = type;
      grmRequest.post('/guests/' + $routeParams.id + '/promotions/submissions', $scope.coupon[type]).then(function(response) {
        $scope.submitError[type].success = false;
      }, function(response) {
        $scope.hideErrors($scope.submitError[type]);
        if (type == 'receipt') {
          if (response == 'RECEIPT_INVALID_NUMBER' || response == 'Request missing or invalid required fields.') {
            $scope.submitError.receipt.invalid = false;
          } else if (response == 'Receipt number has already been used') {
            $scope.submitError.receipt.used = false;
          } else if (response == 'BP promotion rule not found') {
            $scope.submitError.receipt.none = false;
          }
        } else if (type == 'offer') {
          if (response == 'Invalid promotion code' || response == 'Request missing or invalid required fields.') {
            $scope.submitError.offer.invalid = false;
          } else if (response == 'Receipt number has already been used') {
            $scope.submitError.offer.used = false;
          } else if (response == 'BP promotion rule not found') {
            $scope.submitError.offer.none = false;
          }
        } else if (type == 'kidCard') {
          if (response == 'Request missing or invalid required fields.' || response == 'There was an error registering the card.') {
            $scope.submitError.kidCard.invalid = false;
          } else if (response == 'KIDS_CARD_ALREADY_USED') {
            $scope.submitError.kidCard.used = false;
          } else if (response == 'There was an error connecting to Paytronix"') {
            $scope.submitError.kidCard.paytronix = false;
          }
        }
      });
    }

    $scope.hideErrors = function(scp) {
      for(var obj in scp) {
        scp[obj] = true;
      }
    }

    $scope.toggleView = function(scp) {
      $scope[scp] = ($scope[scp] === 'active') ? '' : 'active';
    }

    $scope.deleteOffer = function(scp) {
      grmRequest.delete('/guests/' + $routeParams.id + '/promotions/submissions/' + scp.receipt_submission_id).then(function(data) {
        scp.deleted = true;
      }, function(data){
        console.log(data);
      });
    }

    $scope.getSubmissions = function() {
      grmRequest.get('/guests/' + $routeParams.id + '/promotions/submissions').then(function(data) {
        $scope.offerStatus = data;
      });
    };
    $scope.getSubmissions();

    $scope.populateRules = function() {
      grmRequest.get('/guests/' + $routeParams.id + '/promotions/rules').then(function(data) {
        $scope.receiptRules = data;
      });
    }
    $scope.populateRules();
    
  });


//Guest details page.
bpControllers.controller('GuestTeamHQCtrl',
  function($scope, $route, $routeParams, $rootScope, $location, $filter, grmRequest) {
    $rootScope.containerClass = 'user-container guest-details-container';
    $rootScope.activeTab = 'guest-admin';
    $rootScope.subNav = 'guest-teamhq';
    $scope.guest_id = $routeParams.id;
    $scope.modal = {};
    $scope.modal.msg = '';
    $scope.teams = [];
    $scope.communication = [];
    $scope.receiptNum = [];
    $scope.noTeam = false;

    if($rootScope.currentGuestInfo == undefined){
      grmRequest.get('/guests/' + $routeParams.id + '.json').then(function(data) {
        $rootScope.currentGuestInfo = data;
        $scope.guestInfo = data;
      })
    }else{
      $scope.guestInfo = $rootScope.currentGuestInfo;
    }

    grmRequest.get('/guests/' + $routeParams.id + '/teams.json').then(function(data) {
      $scope.teams = data;
      //console.log(data);
      if (data == '') {
        $scope.noTeam = true;
      }
    }, function(response) {
      $scope.noTeam = true;
    });

    $scope.backBtn = function() {
      $location.path( "/guest-results" );
    }

    $scope.setCommunication = function(id, key) {
      var postData = {
        opt_in: $scope.communication[key]
      }
      grmRequest.post('/guests/' + $routeParams.id + '/teams/' + id + '/communication.json', postData).then(function(data) {
        //console.log(data);
      }, function(response) {
        $scope.modal.msg = response;
        $scope.communication[key] = false;
      });
    }

    var bgReceiptNumber = $filter('bgReceiptNumber');
    $scope.checkReceiptInput = function(k) {
      if ($scope.receiptNum[k] != '') {
        $scope.receiptNum[k] = bgReceiptNumber($scope.receiptNum[k]);
      }
    }

    $scope.addReceipt = function(id, key) {
      var postData = {
        code: "RECEIPT",
        value: $scope.receiptNum[key]
      }
      grmRequest.post('/guests/' + $routeParams.id + '/teams/' + id + '/submissions.json', postData).then(function(data) {
        $scope.receiptNum[key] = '';
      }, function(response) {
        $scope.modal.msg = response;
        $scope.receiptNum[key] = '';
      });
    }

    $scope.removeGuestFromTeam = function(id, key) {
      grmRequest.delete('/teams/' + id + '/members/' + $scope.guestInfo.team_hq_member_id + '.json').then(function(data) {
        $scope.teams.splice(key, 1);
        if ($scope.teams == '') {
          $scope.noTeam = true;
        }
      }, function(response) {
        $scope.modal.msg = response;
      });
    }

  });


//not used controller.
bpControllers.controller('pagenationCtrl',
  function($scope, $rootScope) {
    //Pacenation for all the lists in thie controller
    $scope.pagenation = function(list, perPage) {
      if(list == undefined) {
        //$location.path( "/guest-admin" );
      }else{
        $scope.currentPage = 0;
        $scope.pageSize = perPage;
        $scope.data = list;
        $scope.numberOfPages = function(){
          //console.log($scope.data.length/$scope.pageSize)
          return Math.ceil($scope.data.length/$scope.pageSize);
        }
      }
    }

    var orderBy = $filter('orderBy');
    $scope.order = function(predicate, reverse) {
      list = orderBy(list, predicate, reverse);
    };
    if(sort != undefined){
      $scope.order(sort, false);
    }
    
  });

