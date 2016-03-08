angular.module('myshopping.listservice', [])

.factory('ListService', function ($q, $http) {
  
    return {

      getData: function() {
          var deferred = $q.defer(),
          httpPromise = $http.get('data.json');

          httpPromise.then(function (response) {
            deferred.resolve(response);
          }, function (error) {
            console.error(error);
          });
        return deferred.promise;
      },

      all: function() {
        var listString = window.localStorage['lists'];
        if(listString) {
          return angular.fromJson(listString);
        }
        return [];
      },

      save: function(lists) {
        window.localStorage['lists'] = angular.toJson(lists);
      },

      newList: function(listTitle) {
        // Add a new list
        return {
          title: listTitle,
          items: []
        };
      },

      getLastActiveIndex: function() {
        return parseInt(window.localStorage['lastActiveList']) || 0;
      },
      
      setLastActiveIndex: function(index) {
        window.localStorage['lastActiveList'] = index;
      }
        
    }

});