// Model
var scheduleModel = {
  addTask: function(taskObject) {
    if('oneDayScheduleTasks' in localStorage) {
      var data = JSON.parse(localStorage.getItem('oneDayScheduleTasks'));
      data.push(taskObject);
      localStorage.setItem('oneDayScheduleTasks', JSON.stringify(data));
    }
    else {
      var data = [];
      data.push(taskObject);
      localStorage.setItem('oneDayScheduleTasks', JSON.stringify(data));
    }
  },
  getTasks: function() {
    return JSON.parse(localStorage.getItem('oneDayScheduleTasks'));
  }
};

// Module & Controller
angular
.module('scheduleApp', [])
.controller('scheduleCtrl', function($scope) {
  
  // filling timers
  $scope.timerHoursFrom   = [];
  $scope.timerMinutesFrom = [];

  $scope.timerHoursTo   = [];
  $scope.timerMinutesTo = [];

  for(var i=0; i < 24; i++) {
    var timerItem = {
      display: ((i < 10) ? '0' + i : i),
      value: i
    };

    $scope.timerHoursFrom.push(timerItem);
    $scope.timerHoursTo.push(timerItem);
  }

  for(var i=0; i < 60; i++) {
    var timerItem = {
      display: ((i < 10) ? '0' + i : i),
      value: i
    };

    $scope.timerMinutesFrom.push(timerItem);
    $scope.timerMinutesTo.push(timerItem);
  }

  // set default time from
  $scope.timerHoursFromSelected   = $scope.timerHoursFrom[7];
  $scope.timerMinutesFromSelected = $scope.timerMinutesFrom[0];

  // set default time to
  $scope.timerHoursToSelected     = $scope.timerHoursTo[8];
  $scope.timerMinutesToSelected   = $scope.timerMinutesTo[0];

  // existing tasks
  $scope.tasks = scheduleModel.getTasks();

  // -----------------------------------------------------------
  //                         Behaviors
  // -----------------------------------------------------------

  $scope.formSubmit = function() {
    // timers data
    var timerHoursFromSelected    = $scope.timerHoursFromSelected;
    var timerMinutesFromSelected  = $scope.timerMinutesFromSelected;
    var timerHoursToSelected      = $scope.timerHoursToSelected;
    var timerMinutesToSelected    = $scope.timerMinutesToSelected
    var taskDescription           = $scope.taskDescription;

    scheduleModel.addTask({
      hourFrom:     timerHoursFromSelected.value,
      minuteFrom:   timerMinutesFromSelected.value,
      hourTo:       timerHoursToSelected.value,
      minuteTo:     timerMinutesToSelected.value,
      description:  taskDescription
    });

    // update tasks list in scope
    $scope.tasks = scheduleModel.getTasks();

    // reset task description
    $scope.taskDescription = '';
  }

  // taskObject format:
  // { hourFrom: 7, minuteFrom: 0, hourTo: 7, minuteTo: 15, description: 'something string' }

});