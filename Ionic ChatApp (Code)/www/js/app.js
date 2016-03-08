(function () {

var app = angular.module('app', ['ionic', 'btford.socket-io', 'ngSanitize', 'ngCordova']);

app.config(function($stateProvider, $urlRouterProvider) {

    $stateProvider.state('login', {
        url:'/login',
        templateUrl: 'templates/login.html'
      });

    $stateProvider.state('chat', {
        url:'/chat/',
        params: {data: null},
        templateUrl: 'templates/chat.html'
      });

    $urlRouterProvider.otherwise('/login');

});

app.factory('Socket', function (socketFactory) {
  var myIoSocket = io.connect('https://chatapp-leonel88.c9.io/');

  mySocket = socketFactory({
    ioSocket: myIoSocket
  });

  return mySocket;
});

app.directive('ngEnter', function() {
  return function(scope, element, attrs) {
    element.bind("keydown keypress", function(event) {
      if(event.which === 13) {
        scope.$apply(function() 
        {
          scope.$eval(attrs.ngEnter);
        });
        event.preventDefault();
      }
    });
  }
});

app.controller('LoginCtrl', function($scope, $state, $cordovaOauth, $http) {

  $scope.join = function(nickname) {

    if (nickname) {
      $state.go('chat', {data: {nickname: nickname, displayPicture: 'http://www.smartcallcentersolutions.com/images/profile_icon.png'}});
    } 

  };

  $scope.user = {};
  $scope.loginWithFacebook = function() {
    $cordovaOauth.facebook("1063103897068216", ["email"]).then(function(result) {
          // alert(result.access_token);
          $http.get('https://graph.facebook.com/v2.5/me?fields=id,name,picture&access_token=' + result.access_token)
            .success(function(data, status, header, config) {
              $scope.user.fullName = data.name;
              $scope.user.displayPicture = data.picture.data.url;
              // alert($scope.user.fullName + " " + $scope.user.displayPicture);
              $state.go('chat', {data: {nickname: $scope.user.fullName, displayPicture: $scope.user.displayPicture}});
          });
      }, function(error) {
          alert(error);
      });
  };

});

app.controller('ChatCtrl', function($scope, $stateParams, Socket, $timeout, $ionicScrollDelegate, $sce, $cordovaMedia) {

    $scope.status_message = "Welcome to ChatApp";
    $scope.messages = [];
    $scope.nickname = $stateParams.data.nickname;
    $scope.displayPicture = $stateParams.data.displayPicture;

    var COLORS = ['#f44336', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5', '#009688'];

    Socket.on("connect", function() {

        $scope.socketId = this.id;

        var data = {
                      message: $scope.nickname + " has joined the chat!", 
                      sender: $scope.nickname, 
                      socketId: $scope.socketId, 
                      isLog:true,
                      displayPicture: "",
                      color: $scope.getUsernameColor($scope.nickname)
                    };

        Socket.emit("Message", data);
        
    });

    Socket.on("Message", function(data) {

        data.message = fillWithEmoticons(data.message);
        data,message = $sce.trustAsHtml(data.message);

        $scope.messages.push(data);

        if ($scope.socketId == data.socketId) {
          playAudio("audio/outgoing.mp3");
        } else {
          playAudio("audio/incoming.mp3");
        }

        $timeout(function() {
          $ionicScrollDelegate.scrollBottom(true);
        });  
        
    });

    var typing = false;
    var TYPING_TIMER_LENGTH = 2000;

    $scope.updateTyping = function() {

      if(!typing) {
        typing = true;
        Socket.emit("typing", {socketId: $scope.socketId, sender: $scope.nickname});
      }

      lastTypingTime = (new Date()).getTime();

      $timeout(function() {

        var timeDiff = (new Date()).getTime() - lastTypingTime;
        if (timeDiff > TYPING_TIMER_LENGTH && typing) {
          Socket.emit('stop typing', {socketId: $scope.socketId, sender: $scope.nickname});
          typing = false;
        }

      }, TYPING_TIMER_LENGTH)

    };

    Socket.on('stop typing', function(data) {
      $scope.status_message = "Welcome to ChatApp";
    });

    Socket.on('typing', function(data) {
      $scope.status_message = data.sender + " is typing...";
    });

    var playAudio = function(src) {

      if (ionic.Platform.isAndroid() || ionic.Platform.isIOS()) {

          var newUrl = '';

          if(ionic.Platform.isAndroid()) {
            newUrl = "/android_asset/www/" + src; // Only on MobilePhone
          } else {
            newUrl = src;
          } 

          var media = new Media(newUrl, null, null, null);
          media.play();

      } else {
          new Audio(src).play(); // Only on WebBrowser
      }
    }

    $scope.sendMessage = function() {

      if ($scope.message.length == 0) {
        return;
      }

      var newMessage = {sender:'', message:'', socketId:'', isLog:false, color:''};
      newMessage.sender = $scope.nickname;
      newMessage.message = $scope.message;
      newMessage.socketId = $scope.socketId;
      newMessage.isLog = false;
      newMessage.displayPicture = $scope.displayPicture; 
      newMessage.color = $scope.getUsernameColor($scope.nickname);

      Socket.emit("Message", newMessage);

      $scope.message = '';

    };

    var fillWithEmoticons = function(message) {

      message = message.replace(/;\)/g, "<img src='img/emoticons/Adore.png' width='40px' height='40px'/>")
      message = message.replace(/\(y\)/g, "<img src='img/emoticons/wink-icon (1).png' width='40px' height='40px'/>")
      message = message.replace(/O:\)/g, "<img src='img/emoticons/afraid.png' width='40px' height='40px'/>")
      message = message.replace(/:3/g, "<img src='img/emoticons/anger-1.png' width='40px' height='40px'/>")
      message = message.replace(/o.O/g, "<img src='img/emoticons/angry.png' width='40px' height='40px'/>")
      message = message.replace(/O.o/g, "<img src='img/emoticons/angrybird.png' width='40px' height='40px'/>")
      message = message.replace(/:\'\(/g, "<img src='img/emoticons/ashamed.png' width='40px' height='40px'/>")
      message = message.replace(/3:\)/g, "<img src='img/emoticons/Ayes on Fire-128x128.png' width='40px' height='40px'/>")
      message = message.replace(/:\(/g, "<img src='img/emoticons/banana.png' width='40px' height='40px'/>")
      message = message.replace(/:O/g, "<img src='img/emoticons/Big Smile.png' width='40px' height='40px'/>")
      message = message.replace(/8-\)/g, "<img src='img/emoticons/Black heart.png' width='40px' height='40px'/>")
      message = message.replace(/:D/g, "<img src='img/emoticons/Black Smiley with Knocked Out Tooth-128x128.png' width='40px' height='40px'/>")
      message = message.replace(/>:\(/g, "<img src='img/emoticons/Blue Silly Smile-128x128.png' width='40px' height='40px'/>")
      message = message.replace(/\<3/g, "<img src='img/emoticons/Blue Smiley with Glasses-128x128.png' width='40px' height='40px'/>")
      message = message.replace(/\^_\^/g, "<img src='img/emoticons/blue-eye.png' width='40px' height='40px'/>")
      message = message.replace(/\:\*/g, "<img src='img/emoticons/blue-tongue.png' width='40px' height='40px'/>")
      message = message.replace(/\:v/g, "<img src='img/emoticons/blushing.png' width='40px' height='40px'/>")
      message = message.replace(/\<\(\"\)/g, "<img src='img/emoticons/idiot-icon.png' width='40px' height='40px'/>")
      message = message.replace(/\:poop\:/g, "<img src='img/emoticons/safe_image (2).png' width='40px' height='40px'/>")
      message = message.replace(/\:putman\:/g, "<img src='img/emoticons/safe_image.png' width='40px' height='40px'/>")
      message = message.replace(/\(\^\^\^\)/g, "<img src='img/emoticons/stupid-icon.png' width='40px' height='40px'/>")
      message = message.replace(/\:\)/g, "<img src='img/emoticons/welcome-icon.png' width='40px' height='40px'/>")
      message = message.replace(/\-\_\-/g, "<img src='img/emoticons/whoopsy-icon.png' width='40px' height='40px'/>")
      message = message.replace(/8\|/g, "<img src='img/emoticons/wink-icon.png' width='40px' height='40px'/>")
      message = message.replace(/\:P/g, "<img src='img/emoticons/36.png' width='40px' height='40px'/>")
      message = message.replace(/\:\//g, "<img src='img/emoticons/2.png' width='40px' height='40px'/>")
      message = message.replace(/\>\:O/g, "<img src='img/emoticons/Angry Pumpkin-128x128.png' width='40px' height='40px'/>")
      message = message.replace(/\:\|\]/g, "<img src='img/emoticons/apple-11.png' width='40px' height='40px'/>")
      return message;
    }

    $scope.getUsernameColor = function (username) {

        var hash = 7;

        for (var i=0; i<username.length; i++) {
          hash = username.charCodeAt(i)+ (hash<<5) - hash;
        }

        var index = Math.abs(hash % COLORS.length);
        return COLORS[index];
    };

});

app.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
});

}());
