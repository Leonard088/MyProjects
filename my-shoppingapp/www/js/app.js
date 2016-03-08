(function() {

var app = angular.module('app', ['ionic', 'myshopping.listservice', 'ngCordova']);

app.run(function ($ionicPlatform) {
  $ionicPlatform.ready(function () {
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
});

app.config(function ($stateProvider, $urlRouterProvider) {

  $stateProvider.state('noMenu', {
    url: '/noMenu',
    abstract: true,
    templateUrl: 'templates/noMenuState.html'
  });

  $stateProvider.state('noMenu.login', {
    url: '/login',
    views: {
      'noMenuView': {
        templateUrl: 'templates/login.html'
      }
    }
  });

  $stateProvider.state('noMenu.list', {
    url: '/list',
    views: {
      'noMenuView': {
        templateUrl: 'templates/list.html'
      }
    }
  });

  $stateProvider.state('app', {
    url:'/app',
    abstract: true,
    templateUrl: 'templates/main.html'
  });

  $stateProvider.state('app.mylist', {
    url: '/mylist',
    views: {
      'menuContent': {
        templateUrl: 'templates/mylist.html'
      }
    }
  });

  $urlRouterProvider.otherwise('/noMenu/login');

});

app.filter('searchFilter', function() {
  return function(arr, searchString) {
    if(!searchString) {
      return arr;
    }
    var result = [];
    searchString = searchString.toLowerCase();
    angular.forEach(arr, function(item) {
      if(item.name.toLowerCase().indexOf(searchString) == 0) {
        result.push(item);
      }
    });
    return result;
  };

});

app.controller('MainCtrl', function ($scope, $state, $ionicModal, $cordovaSocialSharing, ListService) {

  $scope.shareViaWhatsApp = function(message, image, link) {
    $cordovaSocialSharing.canShareVia("whatsapp", message, image).then(function (result) {
        $cordovaSocialSharing.shareViaWhatsApp(message, image);
    }, function (error) {
        alert("Cannot share on WhatsApp");
    });
  };

  $scope.products = [];

  ListService.getData().then(function (response) {
    $scope.products = response.data;
  }, function (error) {
    console.error(error);
  });

  // Load or initialize lists
  $scope.lists = ListService.all();

  // Called to select the given list
  $scope.selectList = function(list, index) {
    $scope.activeList = list;
    ListService.setLastActiveIndex(index);
  };

  // A utility function for creating a new list
  // with the given listTitle
  var createList = function(listTitle) {
    var newList = ListService.newList(listTitle);
    $scope.lists.push(newList);
    ListService.save($scope.lists);
    $scope.selectList(newList, $scope.lists.length - 1);
    $scope.listModal.hide();
  };

  // Grab the last active, or the first list
  $scope.activeList = $scope.lists[ListService.getLastActiveIndex()];

  // Called to create a new list
  $scope.newList = function(list) {
    var listTitle = list.title;
    if(listTitle) {
      createList(listTitle);
    }

    list.title = '';
  };

  $scope.updateListName = function (listTitle) {
    var title = ListService.newList(listTitle);
      if(title) {
        title = $scope.activeList.title;
      }
    ListService.save($scope.lists);
    $scope.titleModal.hide();
    
  };

  $scope.newGoList = function(list) {
    var listTitle = list.title;
    if(listTitle) {
      createList(listTitle);
    }

    list.title = '';
    $state.go('/noMenu/list');
  };
  
  $scope.addItem = function (item) {
    for(i = 0; i < $scope.products.length; i++) {
      if(item.id == i) {
        item.src = item.url;
        $scope.activeList.items.push(item);
      }
    }  
    ListService.save($scope.lists);
  };

  $scope.toggleImage = function (item) {
    for(i = 0; i < $scope.activeList.items.length; i++) {
      if (item.id == $scope.activeList.items[i].id) {
        $scope.activeList.items[i].url = $scope.activeList.items[i].line;
      }
    }
    ListService.save($scope.lists);
  };

  $scope.moveItem = function (item, fromIndex, toIndex) {
    $scope.activeList.items.splice(fromIndex, 1);
    $scope.activeList.items.splice(toIndex, 0, item);
    ListService.save($scope.lists);
  };

  $scope.toggleReordering = function() {
      $scope.reordering = !$scope.reordering;
  };

  $scope.removeItem = function (item) {
    for(i = 0; i < $scope.activeList.items.length; i++) {
      if (item.id == $scope.activeList.items[i].id) {
        $scope.activeList.items.splice(i, 1);
      }
    }
    ListService.save($scope.lists);
  };

  $scope.removeList = function (list) {
    for(i = 0; i < $scope.lists.length; i ++) {
      if (list.title == $scope.lists[i].title) {
        $scope.lists.splice(i, 1);
        $scope.activeList.items.splice(0, $scope.activeList.items.length);
        delete $scope.activeList.title;
      }
    }
    ListService.save($scope.lists);
  };

  $scope.showListModal = function() {
    $scope.listModal.show();
  };

  $scope.closeNewList = function() {
    $scope.listModal.hide();
  };

  $scope.showNewTitle = function() {
    $scope.titleModal.show();
  };

  $scope.closeNewTitle = function() {
    $scope.titleModal.hide();
  };

  $ionicModal.fromTemplateUrl('templates/modalist.html', function(modal) {
    $scope.listModal = modal;
  }, {
    scope: $scope,
    animation: 'slide-in-up'
  });

  $ionicModal.fromTemplateUrl('templates/modalupdate.html', function(modal) {
    $scope.titleModal = modal;
  }, {
    scope: $scope,
    animation: 'slide-in-up'
  });


});

}());

// $scope.search = "";

//   $scope.sensitiveSearch = function (item) {
//     if($scope.search) {
//       return item.name.indexOf($scope.search) == 0 ||
//              item.name.toLowerCase().indexOf($scope.search) == 0;
//     }
//     return true;
//   };

// app.directive('ngEnter', function() {
//   return function(scope, element, attrs) {
//     element.bind("keydown keypress", function(event) {
//       if (event.which === 13) {
//         scope.$apply(function () {
//           scope.$eval(attrs.ngEnter, {'event': event});
//         });

//         event.preventDefault();
//       }
      
//     });
//   };
//});



