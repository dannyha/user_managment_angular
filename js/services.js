'use strict';

/* Services */

//Set grm server settings here. 
bpServices.factory('grmSettings', function() {
  
  var settings = { 
    url: grm_url+'/csp',
    basicAuth: btoa("OLSONCSP:" + csp_key)
  }
  return settings;
});

//oauth injector
bpServices.factory('AuthInterceptor', function($window, $q, $location, grmSettings) {
  return {
    request: function(config) {
      //console.log(config);
      config.headers = config.headers || {};
      if ($window.sessionStorage.getItem('token')) {
        config.headers.Authorization = 'Basic ' + grmSettings.basicAuth;
      }
      return config || $q.when(config);
    },
    response: function(response) {
      if (response.status === 401) {
        //Redirects user to login page.
        $location.path( "/login" );
      }
      return response || $q.when(response);
    }
  };
});

//all the end point call service.
bpServices.factory('grmRequest', function($http, $window, $q, $rootScope, $location, $route, grmSettings) {
//all the possible request calls.
  return {
    reset: passRest,
    login: loginRequest,
    get: getRequest,
    post: postRequest,
    delete: deleteRequest,
    refresh: refreshToken
  }

//Password reset request
  function passRest(user) {
    $rootScope.processing = true;
    var request = $http({
      method: 'POST', 
      url: grmSettings.url + '/users/' + user + '/passwordReset.json',
      headers: {'Authorization': "Basic " + grmSettings.basicAuth, 'Content-Type': 'application/json;'}
    })

    return( request.then( handleSuccess, handleError ) );
  }

//login request
  function loginRequest(uData) {
    //console.log(grmSettings.url);
    var sData = {'client_id': 'OLSONCSP', "client_secret":csp_key, "grant_type":"password"};
    angular.forEach(uData, function(val, ind){
      sData[ind] = val;
    });
    var request = $http({
      method: 'POST', 
      url: grmSettings.url + '/authenticate', 
      withCredentials: true,
      headers: {'Authorization': "Basic " + grmSettings.basicAuth, 'Content-Type': 'application/json;'},
      data: sData,
    })
    
    return( request.then( handleSuccess, handleError ) );    
  }

//get request
  function getRequest(uri) {  
    $rootScope.processing = true
    var request = $http({
      method: 'GET', 
      url: grmSettings.url + uri, 
      headers: {
        "CSP-Authorization": $window.sessionStorage.getItem('token'),
        "Content-Type": "application/json;"
      }
    })

    return( request.then( handleSuccess, handleError ) );
  }

//post request
  function postRequest(uri, pData) {
    if(!$rootScope.processing){
      $rootScope.processing = true
      var request = $http({
        method: 'POST', 
        url: grmSettings.url + uri, 
        data: pData,
        headers: {
          "CSP-Authorization": $window.sessionStorage.getItem('token'),
          "Content-Type": "application/json;"
        }
      })

      return( request.then( handleSuccess, handleError ) );
    }
  }

//delete request
  function deleteRequest(uri) {
    if(!$rootScope.processing){
      $rootScope.processing = true
      var request = $http({
        method: 'DELETE', 
        url: grmSettings.url + uri, 
        headers: {
          "CSP-Authorization": $window.sessionStorage.getItem('token'),
          "Content-Type": "application/json;"
        }
      });

      return( request.then( handleSuccess, handleError ) );
    }
    

    
  }

//refresh token request
  function refreshToken() {
    var request = $http({
      method: 'POST', 
      url: grmSettings.url + '/authenticate', 
      headers: {'Authorization': "Basic " + grmSettings.basicAuth, 'Content-Type': 'application/json;'},
      data: {'client_id': 'OLSONCSP', 'grant_type': 'refresh_token', 'refresh_token': $window.sessionStorage.getItem('refresh')}
    })

    //close fancybox
    $rootScope.viewBox = '';
    $.fancybox.close();

    return( request.then( handleSuccess, handleError ) );
  }

//error hendler used to refresh tokens
  function handleError( response ) {
    // The API response from the server should be returned in a
    // nomralized format. However, if the request was not handled by the
    // server (or what not handles properly - ex. server error), then we
    // may have to normalize it on our end, as best we can.
    $rootScope.processing = false; //to disable the loading overlay
    //console.log(response)
    if ( ! angular.isObject( response.data ) || ! response.data.message ) {
      $rootScope.expired = true; //comment out before going to live - DH: this seems to fix the silent timout
      return( $q.reject( "An unknown error occurred." ) );
      //$rootScope.logout();
    }
    if ( response.data.status == '401' && $location.url() != '/login') { //token expired.
      $rootScope.expired = true;
    }
    // Otherwise, use expected error message.
    return( $q.reject( response.data.message ) );
  }


  // Successful response
  // from the API response payload.
  function handleSuccess( response ) {
    //console.log(response)
    $rootScope.processing = false; //to disable the loading overlay
    //console.log($rootScope.processing);
    return( response.data );
  }
});


bpServices.factory('teamHqData', function($q, grmRequest) {

    return {
      get: function(team_id) {
        var teamHqData = {};
        var deferred = $q.defer();

        grmRequest.get('/teams/' + team_id + '.json').then(function(data) {
          teamHqData.info = data;
        }).then(
          grmRequest.get('/teams/' + team_id + '/invitations.json').then(function(data) {
            teamHqData.invites = data;
          })
        ).then(
          grmRequest.get('/teams/' + team_id + '/members.json').then(function(data) {
            teamHqData.members = data;
          })
        ).then(
          grmRequest.get('/teams/' + team_id + '/eligiblecaptains.json').then(function(data) {
            teamHqData.eligibleCaptains = data;
          })
        ).then(
          function(){
            deferred.resolve(teamHqData);
          }
        );

        return deferred.promise;

        /*
        grmRequest.get('/teams/' + $routeParams.id + '/eligiblecaptains.json').then(function(data) {
          $rootScope.currentTeamEligibleCaptains = data;
          console.log($rootScope.currentTeamEligibleCaptains);
        });
        */

      },
      set: function(obj, id) {
        var deferred = $q.defer();
        if (obj == undefined) {
          this.get(id).then(
            function(data) {
              obj = data;
              deferred.resolve(obj);
            }
          );
        }
        return deferred.promise;
      }
    }
});