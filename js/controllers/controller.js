app.controller('graphController', function($scope, $firebaseArray, FIREBASE_URL){

var ref = new Firebase(FIREBASE_URL + '/drinks');
$scope.graphData = $firebaseArray(ref);

});
