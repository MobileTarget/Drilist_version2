// Ionic Starter App
// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var app = angular.module('drilist2', ['ionic', 'darthwade.loading', 'ngTouch', 'ngStorage', 'xeditable'])

.run(function ($ionicPlatform) {
	$ionicPlatform.ready(function () {
		// if (window.cordova && window.cordova.plugins.Keyboard) {
		// 	// Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
		// 	// for form inputs)
		// 	cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

		// 	// Don't remove this line unless you know what you are doing. It stops the viewport
		// 	// from snapping when text inputs are focused. Ionic handles this internally for
		// 	// a much nicer keyboard experience.
		// 	cordova.plugins.Keyboard.disableScroll(true);
		// }
		if (window.StatusBar) {
			StatusBar.styleDefault();
		}

		var pushNotification;
	    var pushConfig = {
	        android: {
	            senderID: "246312602860"
	        },
	        ios: {
	            alert: true,
	            badge: true,
	            sound: true
	        }
	    };

	    var push = window.PushNotification.init(pushConfig);

	    push.on('registration', function(data) {
	        var token = data.registrationId;
	        window.localStorage.device_id = token;
	       
	        console.log('OK: register notfy ', token);
	        console.log('registration All Data ', data);

	    });

	    push.on('notification', function(data) {
	        // var token = data.registrationId
	        console.log('notification', data);
	    });

	});
});
