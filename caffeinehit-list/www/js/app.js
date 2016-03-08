var app = angular.module('caffeinehit', [
	'ionic',
	'ngCordova',
	'caffeinehit.controllers',
	'caffeinehit.services',
	'caffeinehit.filters'

]);

app.run(function ($ionicPlatform) {
	$ionicPlatform.ready(function () {
		if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
			cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
			cordova.plugins.Keyboard.disableScroll(true);

		}
		if (window.StatusBar) {
			StatusBar.styleDefault();
		}
	});
});

app.config(function ($httpProvider) {
	$httpProvider.defaults.headers.common['Authorization'] = 'Token 3a3961503bab2455fcd5d6493bb5e8cc7ddffd50';
});
