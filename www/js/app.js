// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic', 'btford.socket-io', 'ngCordova', 'ngCordovaOauth', 'ngStorage', 'firebase'])

.run(function($ionicPlatform) {
  
  $ionicPlatform.ready(function() {
    if(window.cordova && window.cordova.plugins.Keyboard) {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

      // Don't remove this line unless you know what you are doing. It stops the viewport
      // from snapping when text inputs are focused. Ionic handles this internally for
      // a much nicer keyboard experience.
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
})
.config(function($stateProvider, $urlRouterProvider){
  $stateProvider
  .state('login',{
    url:'/login',
    templateUrl: 'templates/login.html'
})

  .state('projects',{
    url:'/projects',
    templateUrl: 'templates/projects.html'
})

  .state('coremembers',{
    url:'/coremembers',
    templateUrl: 'templates/coremembers.html'
})

  .state('accounts',{
    url:'/accounts',
    templateUrl: 'templates/accounts.html'
})

  .state('events',{
    url:'/events',
    templateUrl: 'templates/events.html'
})

 .state('chat',{
    url:'/chat',
    params: {data : null},
    templateUrl: 'templates/chat.html'
 });

 $urlRouterProvider.otherwise('/login');
})

.factory('Socket', function (socketFactory) {
  var myIoSocket = io.connect('https://perschatapp.herokuapp.com/');

  mySocket = socketFactory({
    ioSocket: myIoSocket
  });

  return mySocket;
})

.directive('ngEnter', function(){
  return function(scope, element, attrs) {
    element.bind("keydown keypress", function(event){
      if(event.which === 13)
      {
        scope.$apply(function()
        {
          scope.$eval(attrs.ngEnter);
        });
        event.preventDefault();
      }
    });
  }
})

.controller('LoginController', function($scope, $state, $cordovaOauth, $http, $firebaseAuth, $localStorage, $window){
  $scope.join = function(nickname){
    if(nickname)
    {
      $state.go('chat', {data: {nickname: nickname, displayPicture: 'img/profile_icon.jpg'}});
    }
  }

$scope.user = {};
openFB.init({appId: '1800960423459125'})


	$scope.loginWithFacebook = function(){
  openFB.getLoginStatus(function(response) {
   if (response.status === 'connected') {
    // alert("connected");
       $localStorage.accessToken = response.authResponse.accessToken;
         $http.get('https://graph.facebook.com/v2.7/me?fields=id,name,picture&access_token=' + $localStorage.accessToken).success(function(data, status, header, config){
         $scope.user.fullName = data.name;
         $scope.user.displayPicture = data.picture.data.url;
       //   alert($scope.user.fullName+ "" + $scope.user.displayPicture);
        $state.go('chat', {data: {nickname: $scope.user.fullName, displayPicture: $scope.user.displayPicture}});
    
       })

      
    } else {
	
	  
openFB.login(function(response) {
 // alert("calling login");
  //   $cordovaOauth.facebook("1800960423459125", ["email"]).then(function(result) {
         $localStorage.accessToken = response.authResponse.accessToken;
         
       $http.get('https://graph.facebook.com/v2.7/me?fields=id,name,picture&access_token=' + $localStorage.accessToken).success(function(data, status, header, config){
         $scope.user.fullName = data.name;
         $scope.user.displayPicture = data.picture.data.url;
       //   alert($scope.user.fullName+ "" + $scope.user.displayPicture);
        $state.go('chat', {data: {nickname: $scope.user.fullName, displayPicture: $scope.user.displayPicture}});
       
       })
          
        }, function(error) {
            alert(error);
        });
  

}

 })
  }
 
 $scope.projects = function(){
   $state.go('projects');

 }

  $scope.coremembers = function(){
   $state.go('coremembers');

 }

  $scope.accounts = function(){
   $state.go('accounts');

 }

  $scope.events = function(){
   $state.go('events');

 }

})
      
.controller('ChatController', function($scope,  $state, $timeout, $stateParams, Socket, $ionicScrollDelegate, $cordovaMedia, $ionicActionSheet, $ionicLoading, $cordovaFacebook, $localStorage){

 $scope.status_message = "Welcome to ChatApp";
 $scope.messages = [];
 $scope.nickname = $stateParams.data.nickname;
 $scope.displayPicture = $stateParams.data.displayPicture;
 //$scope.displayPicture = "img/profile_icon.jpg"; 

 var COLORS = ['#f44336', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5', '#009688'];
  
  Socket.on("connect", function(){
    $scope.socketId = this.id;
    var data = {
                message: $scope.nickname  +  " has joined the chat!", 
                sender: $scope.nickname, 
                socketId: $scope.socketId,
                isLog: true,
                displayPicture: "",
                color: $scope.getUsernameColor($scope.nickname)
                };

    Socket.emit("Message", data);
    
  });
  
  Socket.on("Message", function(data){
    $scope.messages.push(data);

    if($scope.scoketId == data.socketId)
    playAudio("audio/outgoing.mp3");
    else
    playAudio("audio/outgoing.mp3");

    $ionicScrollDelegate.$getByHandle('mainScroll').scrollBottom(true);
  })

  var typing = false;
  var TYPING_TIMER_LENGTH = 2000;

  $scope.updateTyping = function(){
    if(!typing){
      typing = true;
      Socket.emit("typing", {socketId: $scope.socketId, sender: $scope.nickname});
    }

    lastTypingTime = (new Date()).getTime();

    $timeout(function(){
      var timeDiff = (new Date()).getTime() - lastTypingTime;

      if(timeDiff >= TYPING_TIMER_LENGTH && typing){
        Socket.emit('stop typing', {socketId: $scope.socketId, sender: $scope.nickname});
        typing = false;
      }
    }, TYPING_TIMER_LENGTH)
  }
 
Socket.on('stop typing', function(data){
$scope.status_message = "Welcome to ChatApp";
})

Socket.on('typing', function(data){
  $scope.status_message = data.sender + " is typing...";
})

 var playAudio = function(src)
 {
   if(ionic.Platform.isAndroid() || ionic.Platform.isIOS())
   {
     var newUrl = '';
     if(ionic.Platform.isAndroid()) {
       newUrl = "/android_asset/www/" + src
     }
     else
       newUrl = src;

     var media = new Media(newUrl, null, null, null);
     media.play();
   }
   else
   {
     new Audio(src).play();
   }
 }

 $scope.sendMessage = function(){
   if($scope.message.length == 0)
   return;
   var newMessage = {sender:'', message:'', socketId:'', isLog:false, color:''};
   newMessage.sender = $scope.nickname;
   newMessage.message = $scope.message;
   newMessage.socketId = $scope.socketId;
   newMessage.isLog = false;
   newMessage.displayPicture = $scope.displayPicture;
   newMessage.color = $scope.getUsernameColor($scope.nickname);

   Socket.emit("Message", newMessage);

   $scope.message='';
 }

 $scope.getUsernameColor = function(username) {
   var hash = 7;

   for(var i=0; i<username.length;i++)
   {
     hash = username.charCodeAt(i)+ (hash<<5) - hash;
   }

   var index = Math.abs(hash % COLORS.length);
   return COLORS[index];
 }

 /* $scope.showLogout = function() {
    
    var hideSheet = $ionicActionSheet.show({
			destructiveText: 'Logout',
      cancelText: 'Cancel',
			titleText: 'Are you sure you want to logout?',
			cancel: function() {},
			buttonClicked: function(index) {
				return true;
			},
			destructiveButtonClicked: function(){
				$ionicLoading.show({
				  template: 'Logging out...'
				});

//         Facebook logout
//         $ionicLoading.hide();
         openFB.logout(function(response) {
           delete $localStorage.accessToken;
           $state.go('login');
           
          $ionicLoading.hide();
         })
//        },
 //       function(fail){
 //         $ionicLoading.hide();
//        });
			}
		});
	};*/

  $scope.returntoLogin = function() {
    $state.go('login');
  }
})
