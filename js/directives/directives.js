'use strict';

/* Directives */

bpApp.directive('fancybox', function($compile, $timeout) {
  return {
    restrict: 'A',
    replace: false,
    link: function($scope, element, attrs) {
      $scope.open_fancybox = function() {
        $timeout(function(){
          var el = angular.element(element.html()),
          options = {closeBtn: false,  helpers : {overlay : {closeClick: false}}};
          $.fancybox.open(el, options);
          $compile(el)($scope);
        });
      }
      $scope.close_fancybox = function() {
        var el = angular.element(element.html());
        $.fancybox.close(el);
      }
      $scope.update_fancybox = function() {
        var el = angular.element(element.html());
        $.fancybox.update(el);
      }
      //$scope.$watch(function() { return  });
    }
  };
});

bpApp.directive("autofill", function () {
  return {
     restrict: "A",
     require: "?ngModel",
     link: function(scope, element, attrs, ngModel) {
       setInterval(function() {
         var prev_val = '';
         if (!angular.isUndefined(attrs.xAutoFillPrevVal)) {
           prev_val = attrs.xAutoFillPrevVal;
         }
         if (element.val()!=prev_val) {
           if (!angular.isUndefined(ngModel)) {
             if (!(element.val()=='' && ngModel.$pristine)) {
               attrs.xAutoFillPrevVal = element.val();
               scope.$apply(function() {
                 ngModel.$setViewValue(element.val());
               });
             }
           }
           else {
             element.trigger('input');
             element.trigger('change');
             element.trigger('keyup');
             attrs.xAutoFillPrevVal = element.val();
           }
         }
       }, 300);
    }
  };
});

bpApp.directive('numbersOnly', function(){
   return {
     require: 'ngModel',
     link: function(scope, element, attrs, modelCtrl) {
       modelCtrl.$parsers.push(function (inputValue) {
           // this next if is necessary for when using ng-required on your input. 
           // In such cases, when a letter is typed first, this parser will be called
           // again, and the 2nd time, the value will be undefined
           if (inputValue == undefined) return '' 
           var transformedInput = inputValue.replace(/\s|[^0-9]/g, ''); 
           if (transformedInput!=inputValue) {
              modelCtrl.$setViewValue(transformedInput);
              modelCtrl.$render();
           }         

           return transformedInput;         
       });
     }
   };
});

bpApp.directive('birthday', function(){
   return {
     require: 'ngModel',
     link: function(scope, element, attrs, modelCtrl) {
      modelCtrl.$parsers.push(function (inputValue) {
        // this next if is necessary for when using ng-required on your input. 
        // In such cases, when a letter is typed first, this parser will be called
        // again, and the 2nd time, the value will be undefined
        if (inputValue == undefined) return '' 
        var transformedInput = inputValue.replace(/\s|[^0-9-]/g, ''); 
        if (transformedInput!=inputValue) {
          modelCtrl.$setViewValue(transformedInput);
          modelCtrl.$render();
        }         
        return transformedInput;         
      });
     }
   };
});

bpApp.directive('floatNumber', function(){
   return {
     require: 'ngModel',
     link: function(scope, element, attrs, modelCtrl) {
      modelCtrl.$parsers.push(function (inputValue) {
        // this next if is necessary for when using ng-required on your input. 
        // In such cases, when a letter is typed first, this parser will be called
        // again, and the 2nd time, the value will be undefined
        if (inputValue == undefined) return '' 
        var transformedInput = inputValue.replace(/\s|[^0-9.]/g, ''); 
        if (transformedInput!=inputValue) {
          modelCtrl.$setViewValue(transformedInput);
          modelCtrl.$render();
        }         
        return transformedInput;         
      });
     }
   };
});

bpApp.directive('capitalize', function() {
   return {
     require: 'ngModel',
     link: function(scope, element, attrs, modelCtrl) {
        var capitalize = function(inputValue) {
          if (inputValue == undefined) return ''
          var capitalized = angular.uppercase(inputValue).replace(/(\s)/, '');
          if(capitalized !== inputValue) {
            modelCtrl.$setViewValue(capitalized);
            modelCtrl.$render();
          }         
          return capitalized;
         }
         modelCtrl.$parsers.push(capitalize);
         capitalize(scope[attrs.ngModel]);  // capitalize initial value
     }
   };
});

bpApp.directive('match', function () {
        return {
            require: 'ngModel',
            restrict: 'A',
            scope: {
                match: '='
            },
            link: function(scope, elem, attrs, ctrl) {
                scope.$watch(function() {
                    return (ctrl.$pristine && angular.isUndefined(ctrl.$modelValue)) || scope.match === ctrl.$modelValue;
                }, function(currentValue) {
                    ctrl.$setValidity('match', currentValue);
                });
            }
        };
    });



bpApp.directive('storeForm', function() {
  return {
    restrict: 'A',
    transclude: true,
    scope: {
      location: "=?storeForm"
    },
    controller: function($scope, $rootScope, grmRequest) {

      $scope.reset = function() {
        $scope.province = 'Province';
        $scope.city = 'City';
        $scope.cityList = {};
        $scope.cList = '';
        $scope.cLoc = [];
        $scope.pLoc = [];
        $scope.teamHqStore = {};
        $scope.location.storeInfo = {};
        $scope.location.reset = false;
      }
      $scope.reset();
      
      $scope.$watch('location.reset', function(){
        if ($scope.location.reset == true) {
          $scope.reset();
        }
      });

      $scope.$watch('location.currentId', function(){
        if ($scope.location.currentId != undefined) {
          var currentLocation = {};

          grmRequest.get('/stores.json?numberOfStores=-1').then(function(data){
            for (var all in data) {
              if (data[all].store_id == $scope.location.currentId) {
                currentLocation = data[all];
                $scope.teamHqStore.city = data[all].city;
              }
            }

            for (var prov in $rootScope.provinces) {
              if ($rootScope.provinces[prov].v == currentLocation.province) {
                $scope.province = $rootScope.provinces[prov].n;
                $scope.teamHqStore.province = $rootScope.provinces[prov];
              }
            }

            $scope.changeProvince();

            $scope.cityList = [];
            for (var all in data) {
              if (data[all].province == currentLocation.province) {
                $scope.cityList.push(data[all]);
              }
            }

            $scope.changeCity();
            $scope.locations = currentLocation.name;
            $scope.location.storeInfo = currentLocation;

          });

        }
      });
      
      $scope.changeProvince = function() {
        $scope.province = $scope.teamHqStore.province.n;
        var param = '?province=' + $scope.teamHqStore.province.v + '&numberOfStores=-1';

        $scope.cList = [];
        $scope.cLoc = [];
        $scope.city = 'City';
        $scope.locations = 'Location';
        $scope.location.storeInfo = {};

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
        $scope.city = $scope.teamHqStore.city;
        $scope.location.storeInfo = {};
        angular.forEach($scope.cityList, function(obj) {
          if(obj.city == $scope.city){
            $scope.cLoc.push(obj);
          }
        });
      }

      $scope.changeLocations = function() {
        $scope.location.storeInfo = {};
        angular.forEach($scope.cLoc, function(obj) {
          if(obj.store_id == $scope.teamHqStore.bpStoreId){
            $scope.locations = obj.name;
            $scope.location.storeInfo = obj;
          }
        });
      }

    },
    templateUrl: 'js/directives/storeform.html'
  };
});


bpApp.directive('pagination', function() {
  return {
    restrict: 'A',
    transclude: true,
    scope: {
      option: "=pagination",
      backurl: "="
    },
    controller: function($scope) {

      $scope.numberOfPages = function(obj, size){
        return Math.ceil(obj.length/size);                
      }

    },
    templateUrl: 'js/directives/pagination.html'
  };
});


bpApp.directive('genericModal', function() {
  return {
    restrict: 'A',
    transclude: true,
    scope: {
      option: "=genericModal"
    },
    controller: function($scope) {

      $scope.option.action = false;

      $scope.$watch('option.msg', function(){
        if($scope.option.msg != '') {
          $scope.confirmBox($scope.option.msg)
        }
      });

      $scope.confirmBox = function(msg) {
        $scope.confirmation = msg;
        $scope.viewBox = 'confirm';
        $scope.open_fancybox();
      }

      $scope.closeBox = function() {
        $scope.viewBox = '';
        $scope.option.msg = '';
        $scope.close_fancybox();
      }

      $scope.callAction = function() {
        $scope.option.action = true;
        $scope.closeBox();
      }

    },
    templateUrl: 'js/directives/modal.html'
  };
});


bpApp.directive('renderTabs', function() {
  return {
    restrict: 'A',
    link: function(scope, elm, attrs) {
      var jqueryElm = $(elm[0]);
      $(jqueryElm).tabs()
    }
  };
});

