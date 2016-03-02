function rand(a, b) {
  return Math.round(a + (b - a) * Math.random());
}

function createHash(count) {
  var arr = [0,1,2,3,4,5,6,7,8,9,'a','b','c','d'];
  var hash = '';
  for(var i=0; i<=count; i++) {
    hash += arr[rand(0, arr.length - 1)];
  }
  return hash;
}

// ---------------------------------------------------------------------
//                     Begin Angular Application
// ---------------------------------------------------------------------

// Model
var scheduleModel = {
  addTask: function(taskObject) {
    var data = this.getTasks();
    data.push(taskObject);
    localStorage.setItem('oneDayScheduleTasks', JSON.stringify(data));
  },
  getTasks: function() {
    return JSON.parse(localStorage.getItem('oneDayScheduleTasks')) || [];
  },
  removeTask: function(hash) {
    var data = this.getTasks();
    for(var i=0; i<data.length; i++) {
      if(data[i].hash === hash) {
        data.splice(i, 1);
      }
    }
    localStorage.setItem('oneDayScheduleTasks', JSON.stringify(data));
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

  // prepare array of objects tasks data for view
  function transformTasksDataForView() {
    var modelData = scheduleModel.getTasks().sort(function(a, b) {
      return a.beginOfMinutes - b.beginOfMinutes;
    });
    var tasksDataForView = [];

    for(var i=0; i<modelData.length; i++) {
      var hourFrom    = Math.floor(modelData[i].beginOfMinutes / 60);
      var minuteFrom  = modelData[i].beginOfMinutes % 60;
      var hourTo      = Math.floor(modelData[i].endOfMinutes / 60);
      var minuteTo    = modelData[i].endOfMinutes % 60;

      tasksDataForView.push({
        hash:        modelData[i].hash,
        hourFrom:    hourFrom,
        minuteFrom: (minuteFrom < 10) ? ('0' + minuteFrom) :  minuteFrom,
        hourTo:      hourTo,
        minuteTo:   (minuteTo   < 10) ? ('0' + minuteTo)   :  minuteTo,
        description: modelData[i].description
      });
    }
    return tasksDataForView;
  }

  // validate time ranges
  function isValidTimeRange(beginOfMinutes, endOfMinutes) {
    if(beginOfMinutes > endOfMinutes && endOfMinutes != 0) {
      $scope.showError = 'Укажите корректный интервал времени!';
      return false;
    }

    if(beginOfMinutes == endOfMinutes) {
      $scope.showError = 'Интервал времени не может составлять 0 минут!';
      return false;
    }

    var planedTasks = scheduleModel.getTasks();
    for(var i=0; i<planedTasks.length; i++) {

      // invalid condition for add task
      var condition = beginOfMinutes >= planedTasks[i].beginOfMinutes
        && beginOfMinutes < planedTasks[i].endOfMinutes
        || endOfMinutes > planedTasks[i].beginOfMinutes
        && endOfMinutes <= planedTasks[i].endOfMinutes;

      if(condition) {
        $scope.showError = 'В этом интервале времени у Вас уже есть задачи!';
        return false;
      }
    }
    return true;
  }

  $scope.showError = false;

  // add existing tasks to scope
  $scope.tasks = transformTasksDataForView();

  // -----------------------------------------------------------
  //                         Behaviors
  // -----------------------------------------------------------

  $scope.formSubmit = function() {
    
    // timer form data
    var hourFrom        = $scope.timerHoursFromSelected.value;
    var minuteFrom      = $scope.timerMinutesFromSelected.value;
    var hourTo          = $scope.timerHoursToSelected.value;
    var minuteTo        = $scope.timerMinutesToSelected.value;
    var taskDescription = $scope.taskDescription;

    // prepare time range for delivery to model
    var beginOfMinutes  = hourFrom * 60 + minuteFrom;
    var endOfMinutes    = hourTo   * 60 + minuteTo;

  if(isValidTimeRange(beginOfMinutes, endOfMinutes)) {
      // delivery data to model
      scheduleModel.addTask({
        hash:           createHash(10),
        beginOfMinutes: beginOfMinutes,
        endOfMinutes:   endOfMinutes,
        description:    taskDescription
      });

      // change timers value
      $scope.timerHoursFromSelected   = $scope.timerHoursToSelected;
      $scope.timerMinutesFromSelected = $scope.timerMinutesToSelected;

      $scope.timerHoursToSelected = (hourTo === 23) ? $scope.timerHoursTo[0] : $scope.timerHoursTo[hourTo + 1];
      $scope.timerMinutesToSelected = $scope.timerMinutesTo[0];

      // update tasks list in scope
      $scope.tasks = transformTasksDataForView();

      // reset task description
      $scope.taskDescription = '';
   }
  }

  // taskObject format (for example):
  // {
  //   hash:            '72ac1755763',
  //   beginOfMinutes:  420,
  //   endOfMinutes:    435,
  //   description:     'something string'
  // }

  $scope.removeTask = function(hash) {
    if(confirm('Задача будет удалена!')) {
      scheduleModel.removeTask(hash);

      // update tasks list in scope
      $scope.tasks = transformTasksDataForView();

      if($scope.showError === 'В этом диапазоне времени у Вас уже есть задачи!') {
        $scope.showError = false;
      }
    }
  } 

});

// ---------------------------------------------------------------------
//                       End Angular Application
// ---------------------------------------------------------------------