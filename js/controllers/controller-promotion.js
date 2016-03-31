'use strict';

/* Controllers */

bpControllers.controller('PromotionActionCtrl', function($scope, $route,
		$rootScope, $location, $filter, grmRequest) {
	$rootScope.containerClass = 'promotion-container';
	$rootScope.activeTab = 'promotion-actions';
	$rootScope.subNav = 'promotion-actions';
	$rootScope.contests = {};
	$rootScope.offers = {};

	grmRequest.get('/contests/').then(function(data) {
		if (data.contests != undefined) {
			$rootScope.contests = data.contests;
		} else {
			$rootScope.contests = {};
		}
	});

    grmRequest.get('/offers/').then(function(data) { 
      if(data != undefined){
        $rootScope.offers = data;
      }else{
      	$rootScope.offers={};
      }   
    });  
    
	grmRequest.get('/promotions/actions/').then(function(data) {
		if (data.bp_promotion_actions != undefined) {
			$rootScope.bp_promotion_actions = data.bp_promotion_actions;
		} else {
			$rootScope.bp_promotion_actions = {};
		}
	});

	$scope.addActionBox = function() {
		$scope.type = 'Quantity';
		$scope.add = {};
		$scope.overlayType = 'addAction';
		$scope.add.name = "";
		$scope.add.target = "";
		$scope.add.action_type = "";
		$scope.open_fancybox();
	}

	$scope.addAction = function() {
		var hasEmptyFields = false;
		if ($scope.add.name === "" || $scope.add.value === ""
				|| $scope.add.action_type === "" || $scope.add.target === ""
				|| $scope.add.action_type === null
				|| $scope.add.target === null) {
			hasEmptyFields = true;
		}

		if (hasEmptyFields) {
			$scope.add.error = "Please fulfill all the required fields.";
			return;
		}

		var addData = {
			name : $scope.add.name,
			action_type : $scope.add.action_type.v,
			target : $scope.add.target
		};

		var currentActionType =$scope.add.action_type;

		if(currentActionType.n == 'ENROLL') {
			for(var contest in $rootScope.contests) {
				if($rootScope.contests[contest].title_en == addData.target) {
					addData.target =  $rootScope.contests[contest].contest_code;
					break;
				}
			}
		} else if(currentActionType.n == 'INCREMENT') {
			for(var offer in $rootScope.offers) {
				if($rootScope.offers[offer].offerTitle == addData.target) {
					addData.target = $rootScope.offers[offer].walletCode;
					break;
				}
			}
		}

		grmRequest.post('/promotions/actions/', addData).then(function(data) {
			$scope.reloadData();
			$scope.close_fancybox();
		}, function(error) {
			$scope.add.error = error;
		});
	}

	$scope.editActionBox = function(actionCode) {
		$rootScope.isEnroll = '';

		grmRequest.get('/promotions/actions/'+actionCode).then(function(data) {
			if(data != undefined) {
				$scope.actionToEdit = data;
				$scope.actionToEdit.action_code = data.action_code;
				$scope.actionToEdit.action_type = data.action_type;
	
				for(var actionType in $rootScope.promotionActionTypes) {
					if($rootScope.promotionActionTypes[actionType].v == data.action_type) {
						$scope.actionToEdit.action_type =  $rootScope.promotionActionTypes[actionType];
						break;
					}
				}

				var currentActionType =$scope.actionToEdit.action_type;

				if(currentActionType.n == 'ENROLL') {
					for(var contest in $rootScope.contests) {
						if($rootScope.contests[contest].contest_code == data.target) {
							$scope.actionToEdit.target =  $rootScope.contests[contest].title_en;
							break;
						}
					}

					$rootScope.isEnroll = 'ENROLL';
					$rootScope.promotionActionTargets = $rootScope.contests;
				} else if(currentActionType.n == 'INCREMENT') {
					for(var offer in $rootScope.offers) {
						if($rootScope.offers[offer].walletCode == data.target) {
							$scope.actionToEdit.target =  $rootScope.offers[offer].offerTitle;
							break;
						}
					}

					$rootScope.isEnroll='INCREMENT';
					$rootScope.promotionActionTargets = $rootScope.offers;
				}
			}

			$scope.edit = {};  
			$scope.overlayType = 'editAction';
			$scope.open_fancybox();		
		});
	}

	$scope.editAction = function(){
		var editData = {
			name : $scope.actionToEdit.name,
			action_type : $scope.actionToEdit.action_type.v,
			target : $scope.actionToEdit.target
		};

		var currentActionType =$scope.actionToEdit.action_type;

		if(currentActionType.n == 'ENROLL') {
			for(var contest in $rootScope.contests) {
				if($rootScope.contests[contest].title_en == editData.target) {
					editData.target =  $rootScope.contests[contest].contest_code;
					break;
				}
			}
		} else if(currentActionType.n == 'INCREMENT') {
			for(var offer in $rootScope.offers) {
				if($rootScope.offers[offer].offerTitle == editData.target) {
					editData.target = $rootScope.offers[offer].walletCode;
					break;
				}
			}
		}

		var hasEmptyFields = false;

		if($scope.actionToEdit.name == ""||$scope.actionToEdit.action_type == ""||$scope.actionToEdit.target == "")
		{
			hasEmptyFields = true;
	 	}

		if(hasEmptyFields)
		{
			$scope.actionToEdit.error="Please fulfill all the required fields.";
			return;
		}

		grmRequest.post('/promotions/actions/'+$scope.actionToEdit.action_code, editData).then(function(data) {
			$scope.reloadData();
			$scope.close_fancybox();
		});
	}

	$scope.deleteAction = function(action_code){
		grmRequest.delete('/promotions/actions/'+action_code).then(function(data) {
			$scope.close_fancybox();
			$scope.reloadData();
		});
	}

	$scope.closeBox = function() {
		$scope.viewBox = '';
		$scope.close_fancybox();
	}

	$scope.reloadData = function() {
		grmRequest.get('/promotions/actions/').then(function(data) {
			if (data.bp_promotion_actions != undefined) {
				$rootScope.bp_promotion_actions = data.bp_promotion_actions;
			} else {
				$rootScope.bp_promotion_actions = {};
			}
		});
	}

	$scope.updateActionTarget = function(arg) {

		$rootScope.isEnroll = arg;
		$rootScope.isIncrement = '';

		if($rootScope.isEnroll == "ENROLL")
		{
			$rootScope.isEnroll = 'ENROLL';
			$rootScope.promotionActionTargets = $rootScope.contests;
		}
		else if($rootScope.isEnroll == "INCREMENT")
		{
			$rootScope.isEnroll = 'INCREMENT';
			$rootScope.promotionActionTargets = $rootScope.offers;
		}

		$scope.update_fancybox();
	}

	$scope.editActionTarget = function() {
		if ($scope.actionToEdit.action_type != null)
		{
			if($scope.actionToEdit.action_type.v == "ENROLL")
			{
				$rootScope.isEnroll = 'ENROLL';
				$rootScope.promotionActionTargets = $rootScope.contests;
			}
			else if($scope.actionToEdit.action_type.v == "INCREMENT")
			{
				$rootScope.isEnroll = 'INCREMENT';
				$rootScope.promotionActionTargets = $rootScope.offers;
			}
		}

		console.log("enroll " + $rootScope.isEnroll);
	}

});

bpControllers.controller('PromotionOfferCtrl', function($scope, $route,
		$rootScope, $location, $filter, grmRequest) {
	$rootScope.containerClass = 'promotion-container';
	$rootScope.activeTab = 'promotion-offers';
	$rootScope.subNav = 'promotion-offers';
	$rootScope.offers = {};

    grmRequest.get('/offers/').then(function(data) { 
        if(data != undefined){
          $rootScope.offers = data;
	}else{
        	$rootScope.offers={};
        }
	}); 

	$scope.addOfferBox = function() {
		$scope.type = 'Quantity';
		$scope.add = {};
		$scope.overlayType = 'addOffer';
		$scope.add.offer_code = "";
		$scope.add.wallet_code = "";
		$scope.open_fancybox();
	}

	$scope.addOffer = function() {
		var hasEmptyFields = false;
		if ($scope.add.wallet_code === "" || $scope.add.offer_code === ""
				|| $scope.add.wallet_code === null
				|| $scope.add.offer_code === null) {
			hasEmptyFields = true;
		}

		if (hasEmptyFields) {
			$scope.add.error = "Please fulfill all the required fields.";
			return;
		}

		var addData = {
			offer_code : $scope.add.offer_code,
			paytronix_wallet_code : $scope.add.wallet_code
		};

		grmRequest.post('/promotions/offers/', addData).then(function(data) {
			$scope.reloadData();
			$scope.close_fancybox();
		}, function(error) {
			$scope.add.error = error;
		});
	}

	$scope.editOfferBox = function(offerId) {
		grmRequest.get('/promotions/offers/'+offerId).then(function(data) {
			if(data != undefined) {
				$scope.offerToEdit = data;

				for(var x in $rootScope.offers) {
					if($rootScope.offers[x].walletCode == data.paytronix_wallet_code) {
						$scope.offerToEdit.wallet_code =  $rootScope.offers[x].walletCode;
						break;
					}
				}
			}

			$scope.edit = {};  
			$scope.overlayType = 'editOffer';
			$scope.open_fancybox();
		});
	}

	$scope.editOffer = function(){
		var editData = {
				offer_code : $scope.offerToEdit.offer_code,
				paytronix_wallet_code : $scope.offerToEdit.wallet_code
			};;

		var hasEmptyFields = false;

		if($scope.offerToEdit.offer_code == ""||$scope.offerToEdit.wallet_code == "")
		{
			hasEmptyFields = true;
	 	}

		if(hasEmptyFields)
		{
			$scope.offerToEdit.error="Please fulfill all the required fields.";
			return;
		}

		grmRequest.post('/promotions/offers/'+$scope.offerToEdit.offer_id, editData).then(function(data) {
			$scope.reloadData();
			$scope.close_fancybox();
		});
	}

	$scope.deleteOffer = function(offer_id){
		grmRequest.delete('/promotions/offers/'+offer_id).then(function(data) {
			$scope.close_fancybox();
			$scope.reloadData();
		});
	}

	$scope.closeBox = function() {
		$scope.viewBox = '';
		$scope.close_fancybox();
	}

	grmRequest.get('/promotions/offers/').then(function(data) {
		if (data.bp_offers != undefined) {
			$rootScope.bp_offers = data.bp_offers;
		} else {
			$rootScope.bp_offers = {};
		}
	});

	$scope.closeBox = function() {
		$scope.viewBox = '';
		$scope.close_fancybox();
	}

	$scope.reloadData = function() {
		grmRequest.get('/promotions/offers/').then(function(data) {
			if (data.bp_offers != undefined) {
				$rootScope.bp_offers = data.bp_offers;
			} else {
				$rootScope.bp_offers = {};
			}
		});
	}

});

bpControllers.controller('PromotionRuleCtrl', function($scope, $route,
		$rootScope, $location, $filter, grmRequest) {
	$rootScope.containerClass = 'promotion-container';
	$rootScope.activeTab = 'promotion-rules';
	$rootScope.subNav = 'promotion-rules';

	$rootScope.action_codes = [];
	grmRequest.get('/promotions/actions/').then(function(data) {
		if (data.bp_promotion_actions != undefined) {
			$rootScope.promotion_actions = data.bp_promotion_actions;
		} else {
			$rootScope.promotion_actions = {};
		}
	});

	$rootScope.trigger_codes = [];

	grmRequest.get('/promotions/triggers/').then(function(data) { 
		if(data != undefined){
			$rootScope.promotion_triggers = data.bp_promotion_triggers;
		}else{
			$rootScope.promotion_triggers={};
		}
	});

	$scope.addRuleBox = function() {
		$scope.type = 'Quantity';
		$scope.add = {};
		$scope.overlayType = 'addRule';
		$scope.open_fancybox();
		$rootScope.action_codes = [];
		$rootScope.trigger_codes = [];
	}

	// toggle selection for a given fruit by name
	$scope.toggleTriggerSelection = function toggleSelection(triggerCode) {
		var idx = $rootScope.trigger_codes.indexOf(triggerCode);

		// is currently selected
		if (idx > -1) {
			$rootScope.trigger_codes.splice(idx, 1);
		}
		// is newly selected
		else {
			$rootScope.trigger_codes.push(triggerCode);
		}

	};

	// toggle selection for a given fruit by name
	$scope.toggleActionSelection = function toggleSelection(actionCode) {
		var idx = $rootScope.action_codes.indexOf(actionCode);
		
		// is currently selected
		if (idx > -1) {
			$rootScope.action_codes.splice(idx, 1);
		}
		// is newly selected
		else {
			$rootScope.action_codes.push(actionCode);
		}
	};

	$scope.closeBox = function() {
		$scope.viewBox = '';
		$scope.close_fancybox();
	}

	grmRequest.get('/promotions/rules/').then(function(data) {
		if (data.bp_promotion_rules != undefined) {
			$rootScope.bp_promotion_rules = data.bp_promotion_rules;
		} else {
			$rootScope.bp_promotion_rules = {};
		}
	});

	$scope.deleteRule = function(rule_code){
		grmRequest.delete('/promotions/rules/'+rule_code).then(function(data) {
			$scope.close_fancybox();
			$scope.reloadData();
		});
	}

	$scope.addRule = function() {
		var hasEmptyFields = false;
		if ($scope.add.name_en === "" || $scope.add.name_fr === ""
				|| $scope.add.description_en === ""
				|| $scope.add.description_fr === ""
				|| $scope.add.start_date === "" || $scope.add.end_date === ""
				|| $rootScope.action_codes === undefined
				|| $rootScope.trigger_codes === undefined
				|| $rootScope.action_codes === null
				|| $rootScope.trigger_codes === null) {
			hasEmptyFields = true;
		}

		if (hasEmptyFields) {
			$scope.add.error = "Please fulfill all the required fields.";
			return;
		}

		var trigger_codes = {};
		var action_codes = {};

		var addData = {
			name_en : $scope.add.name_en,
			name_fr : $scope.add.name_fr,
			description_en : $scope.add.description_en,
			description_fr : $scope.add.description_fr,
			start_date : $scope.add.start_date,
			end_date : $scope.add.end_date,
			action_codes : $rootScope.action_codes,
			trigger_codes : $rootScope.trigger_codes
		};

		grmRequest.post('/promotions/rules/', addData).then(function(data) {
			$scope.reloadData();
			$scope.close_fancybox();
		}, function(error) {
			$scope.add.error = error;
		});
	}

	$scope.editRuleBox = function(ruleCode) {
		
		grmRequest.get('/promotions/rules/'+ruleCode).then(function(data) {
			if(data != undefined) {
				$scope.ruleToEdit = data;
				$scope.ruleToEdit.action_codes = data.action_codes;
				$scope.ruleToEdit.trigger_codes = data.trigger_codes;

				// Action codes
				for(var actionCode in $rootScope.promotion_actions) {
					if($rootScope.promotion_actions[actionCode].action_code == data.action_type) {
						$scope.ruleToEdit.action_code = $rootScope.promotion_actions.action_codes[actionCode];
					}
				}		

				// Trigger codes
				for(var triggerCode in $rootScope.trigger_codes) {
					if($rootScope.trigger_codes[triggerCode] == data.action_type) {
						$scope.ruleToEdit.trigger_code = $rootScope.trigger_codes[triggerCode];
						break;
					}
				}

				$rootScope.action_codes = data.action_codes;
				$rootScope.trigger_codes = data.trigger_codes;						
			}

			$scope.edit = {};  
			$scope.overlayType = 'editRule';
			$scope.open_fancybox();		
		});
	}

	$scope.editRule = function(){

		var hasEmptyFields = false;
		if ($scope.ruleToEdit.name_en === "" || $scope.ruleToEdit.name_fr === ""
				|| $scope.ruleToEdit.description_en === ""
				|| $scope.ruleToEdit.description_fr === ""
				|| $scope.ruleToEdit.start_date === "" || $scope.ruleToEdit.end_date === ""
				|| $rootScope.action_codes === undefined
				|| $rootScope.trigger_codes === undefined
				|| $rootScope.action_codes === null
				|| $rootScope.trigger_codes === null) {
			hasEmptyFields = true;
		}

		if (hasEmptyFields) {
			$scope.ruleToEdit.error = "Please fulfill all the required fields.";
			return;
		}

		var trigger_codes = {};
		var action_codes = {};

		var editData = {
			name_en : $scope.ruleToEdit.name_en,
			name_fr : $scope.ruleToEdit.name_fr,
			description_en : $scope.ruleToEdit.description_en,
			description_fr : $scope.ruleToEdit.description_fr,
			start_date : $scope.ruleToEdit.start_date,
			end_date : $scope.ruleToEdit.end_date,
			action_codes : $rootScope.action_codes,
			trigger_codes : $rootScope.trigger_codes
		};

		grmRequest.post('/promotions/rules/'+$scope.ruleToEdit.rule_code, editData).then(function(data) {
			$scope.reloadData();
			$scope.close_fancybox();
		}, function(error) {
			$scope.add.error = error;
		});
	}

	$scope.closeBox = function() {
		$scope.viewBox = '';
		$scope.close_fancybox();
	}

	$scope.reloadData = function() {
		grmRequest.get('/promotions/rules/').then(function(data) {
			if (data.bp_promotion_rules != undefined) {
				$rootScope.bp_promotion_rules = data.bp_promotion_rules;
			} else {
				$rootScope.bp_promotion_rules = {};
			}
		});
	}
});

bpControllers.controller('PromotionTriggerCtrl', function($scope, $route,
		$rootScope, $location, $filter, grmRequest) {
	$rootScope.containerClass = 'promotion-container';
	$rootScope.activeTab = 'promotion-triggers';
	$rootScope.subNav = 'promotion-triggers';

	grmRequest.get('/promotions/triggers/').then(function(data) {
		if (data.bp_promotion_triggers != undefined) {
			$rootScope.bp_promotion_triggers = data.bp_promotion_triggers;
		} else {
			$rootScope.bp_promotion_triggers = {};
		}
	});

	$scope.addTriggerBox = function() {
		$scope.type = 'Quantity';
		$scope.add = {};
		$scope.overlayType = 'addTrigger';
		$scope.add.name = "";
		$scope.add.trigger_field = "";
		$scope.add.trigger_type = "";
		$scope.add.value = "";
		$scope.open_fancybox();
	}

	$scope.closeBox = function() {
		$scope.viewBox = '';
		$scope.close_fancybox();
	}

	$scope.addTrigger = function() {
		var hasEmptyFields = false;
		if ($scope.add.name === "" || $scope.add.value === ""
				|| $scope.add.trigger_field === ""
				|| $scope.add.trigger_type === ""
				|| $scope.add.trigger_field === null
				|| $scope.add.trigger_type === null) {
			hasEmptyFields = true;
		}

		if (hasEmptyFields) {
			$scope.add.error = "Please fulfill all the required fields.";
			return;
		}

		var addData = {
			name : $scope.add.name,
			value : $scope.add.value,
			trigger_field : $scope.add.trigger_field.v,
			trigger_type : $scope.add.trigger_type.v
		};

		grmRequest.post('/promotions/triggers/', addData).then(function(data) {
			$scope.reloadData();
			$scope.close_fancybox();
		}, function(error) {
			$scope.add.error = error;
		});
	}
	
	$scope.addTriggerType = function() {
		if($scope.add.trigger_field.v == 'MENU_ITEM' || $scope.add.trigger_field.v == 'PROVINCE') {
			$scope.add.trigger_type = $rootScope.promotionTriggerTypes[2];
		} else {
			$scope.add.trigger_type = "";
		}
	}
	
	$scope.isDisabled = function() {
		if($scope.add.trigger_field.v == 'MENU_ITEM' || $scope.add.trigger_field.v == 'PROVINCE') {
			return true;
		}
	}
	
	$scope.editTriggerBox = function(triggerCode) {
		grmRequest.get('/promotions/triggers/'+triggerCode).then(function(data) {
			if(data != undefined) {
				$scope.triggerToEdit = data;

				for(var x in $rootScope.promotionTriggerFields) {
					if($rootScope.promotionTriggerFields[x].v == data.trigger_field) {
						$scope.triggerToEdit.trigger_field =  $rootScope.promotionTriggerFields[x].v;
						break;
					}
				}

				for(var x in $rootScope.promotionTriggerFields) {
					if($rootScope.promotionTriggerTypes[x].v == data.trigger_type) {
						$scope.triggerToEdit.trigger_type =  $rootScope.promotionTriggerTypes[x].v;
						break;
					}
				}
			}

			$scope.edit = {};  
			$scope.overlayType = 'editTrigger';
			$scope.open_fancybox();
		});
	}

	$scope.editTrigger = function(){
		var editData = {
				name : $scope.triggerToEdit.name,
				value : $scope.triggerToEdit.value,
				trigger_field : $scope.triggerToEdit.trigger_field,
				trigger_type : $scope.triggerToEdit.trigger_type
			};

		var hasEmptyFields = false;

		if ($scope.triggerToEdit.name === "" || $scope.triggerToEdit.value === ""
			|| $scope.triggerToEdit.trigger_field === ""
			|| $scope.triggerToEdit.trigger_type === ""
			|| $scope.triggerToEdit.trigger_field === null
			|| $scope.triggerToEdit.trigger_type === null) {
			hasEmptyFields = true;
		}

		if(hasEmptyFields)
		{
			$scope.triggerToEdit.error="Please fulfill all the required fields.";
			return;
		}

		grmRequest.post('/promotions/triggers/'+$scope.triggerToEdit.trigger_code, editData).then(function(data) {
			$scope.reloadData();
			$scope.close_fancybox();
		});
	}

	$scope.editTriggerType = function() {
		if($scope.triggerToEdit.trigger_field == 'MENU_ITEM' || $scope.triggerToEdit.trigger_field == 'PROVINCE') {
			$scope.triggerToEdit.trigger_type = $rootScope.promotionTriggerTypes[2].v;
		} else {
			$scope.triggerToEdit.trigger_type = "";
		}
	}
	
	$scope.editMenuItem = function() {
		if($scope.triggerToEdit.trigger_field == 'MENU_ITEM' || $scope.triggerToEdit.trigger_field == 'PROVINCE') {
			return true;
		}
	}
	
	$scope.deleteTrigger = function(trigger_code){
		grmRequest.delete('/promotions/triggers/'+trigger_code).then(function(data) {
			$scope.close_fancybox();
			$scope.reloadData();
		});
	}

	$scope.reloadData = function() {
		grmRequest.get('/promotions/triggers/').then(function(data) {
			if (data.bp_promotion_triggers != undefined) {
				$rootScope.bp_promotion_triggers = data.bp_promotion_triggers;
			} else {
				$rootScope.triggers = {};
			}
		});
	}
});
