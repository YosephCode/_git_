
/*
* Services Module - apiGithub
* Service to bring 
* github repositories (repositoriesService),
* github users (usersService) and  
* github contributors (contributorsService)
*/
angular.module('Services',[])
.factory('usersService', ['$http', function($http){
	var usersRequest = function(username){
		return $http({
			method: 'JSONP',
			url: 'https://api.github.com/users/' + username + '?callback=JSON_CALLBACK'
		});
	};
	return {
		event: function(username){
			return usersRequest(username);
		}
	}
}]);


/*
* Main module - App
*/
var app = angular.module('App',['Services', 'ngRoute']);

/*
* Config - Single Page Application
* $routeProvider
* To define the routes the page application
*/
app.config(function($routeProvider){
	$routeProvider
	.when('/', {templateUrl:'../partials/dev-shop.html', controller:'mainController'})
	.when('/compraRealizada', {templateUrl: '../partials/compraRealizada.html'})
	.otherwise({redirectTo:'/'})
});

/**
* Controllers
* MainController: To search the github users 
*/
app.controller('mainController', function($scope, $log, $timeout, usersService){
	var timeout, repositories, gists, followers;
	
	$scope.users = null;
	$scope.devs = [];

	$scope.myForm = {};
	$scope.myForm.username = "";
	$scope.myForm.price = "";

	
	/*
	* Watch the changes at username model and 
	* pass success data to the services.
	*/
	$scope.$watch('username', function(newUsername){
		
		if(newUsername != undefined && newUsername.length > 1){

			$scope.myForm.price = 'calculando';
			

			if(timeout) { console.log("timeoutSearch"); $timeout.cancel(timeout); }
			timeout = $timeout(function(){
				
				/*
				* UsersService
				* take the user (login, followers, following, number of repositories)
				*/
				usersService.event(newUsername).success(function(data,status) {
					$scope.users = data.data;	
					console.log($scope.users);
					$scope.myForm.username = $scope.users.login;
					$scope.myForm = $scope.users;
					repositories = $scope.users.public_repos;
					gists = $scope.users.public_gists;
					followers = $scope.users.followers;

					$scope.calcPrice(repositories, gists, followers);			
				});
			}, 800);
		}else{
			console.log("tono ELSE");
			$scope.myForm.price = "";
			$scope.buttonDisbled = true;
		}
	});

	$scope.calcPrice = function(repos, gists, foll){
		if(repos < 4){
			$scope.myForm.price = ""; 	
		}else if(repos <=9 && repos >=5){
			$scope.myForm.price = $scope.calcTotal(30, gists, foll); 
		}else if(repos >= 10){
			$scope.myForm.price = $scope.calcTotal(100, gists, foll); 
		}else if(repos >=30){
			$scope.myForm.price = $scope.calcTotal(300, gists, foll); 
		}else if(repos >=60){
			$scope.myForm.price = $scope.calcTotal(500, gists, foll); 
		}else if(repos >=100){
			$scope.myForm.price = $scope.calcTotal(1000, gists, foll); 
		}
		$scope.buttonDisbled = false;
	}

	$scope.calcTotal = function(num, gists, foll){
		return num + (gists + (foll/2));
	}

	$scope.addDev = function(data){
		$scope.dev = angular.copy(data);
		var total = 0;
		$scope.username = "";
		$scope.price = "";

		setTimeout(function(){
			
			$scope.$apply(function () {
				$scope.devs.push($scope.dev);
				var max = $scope.devs.length;
				while(max--){
					total = total + $scope.devs[max].price;
					$scope.total = total;
				}
			});
		
		}, 200);
	};

	$scope.removeDev = function(index){
		
		$scope.devs.splice(index, 1);
		
	};

	$scope.readDev = function(index){
		$scope.devInfo = $scope.devs[index];
		console.table($scope.devs);
	};

	$scope.buyDev = function(myDev){
		$scope.myDevs = [];
		$scope.myDevs = myDev;
		$log.info($scope.myDevs);
	}
});