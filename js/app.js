// ---------------------------------------------------------------------
//                     Begin Angular Application
// ---------------------------------------------------------------------

// Model
var scheduleModel = {
  addTask: function(task) {
    var data = this.getTasks();
    data.push(task);
    localStorage.setItem('oneDayScheduleTasks', JSON.stringify(data));
  },
  getTasks: function() {
    return JSON.parse(localStorage.getItem('oneDayScheduleTasks')) || [];
  },
  removeTask: function(id) {
    var data = this.getTasks();
    for(var i=0; i<data.length; i++) {
      if(data[i].id === id) {
        data.splice(i, 1);
      }
    }
    localStorage.setItem('oneDayScheduleTasks', JSON.stringify(data));
  },
  clear: function() {
    localStorage.setItem('oneDayScheduleTasks', '[]');
  }
};

// Module & Controller
angular.module('scheduleApp', [])
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

  // no errors as default value
  $scope.showError = false;

  // current view
  $scope.currentView = 'list';

  // header text
  $scope.headerText = 'Список задач';

  // -----------------------------------------------------------
  //                         Behaviors
  // -----------------------------------------------------------

  // get data from model to scope
  $scope.refresh = function() {
    $scope.tasks = transformTasksDataForView();
  }

  // create new task
  $scope.create = function(task) {
    scheduleModel.addTask(task);
    $scope.refresh();
    $scope.currentView = 'list';
  }

  // delete task
  $scope.delete = function(id) {
    if(confirm('Задача будет удалена!')) {
      scheduleModel.removeTask(id);
      $scope.refresh();
      $scope.currentView = 'list';
    }
  }

  // clear storage
  $scope.deleteAll = function() {
    if(confirm('Вы действительно хотите удалить все задачи?')) {
      scheduleModel.clear();
      $scope.refresh();
    }
  }

  // swith to form view
  $scope.addTask = function() {
    $scope.headerText = 'Создание новой задачи';
    $scope.showError = false;
    $scope.currentView = 'form';
  }

  // switch to list view
  $scope.showTasks = function() {
    $scope.headerText = 'Список задач';
    $scope.currentView = 'list';
  }

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

    if(isValidTimeRange(beginOfMinutes, endOfMinutes, $scope)) {
      // delivery data to model
      $scope.create({
        id:             createHash(10),
        beginOfMinutes: beginOfMinutes,
        endOfMinutes:   endOfMinutes,
        description:    taskDescription
      });

      // change timers value
      $scope.timerHoursFromSelected   = $scope.timerHoursToSelected;
      $scope.timerMinutesFromSelected = $scope.timerMinutesToSelected;

      $scope.timerHoursToSelected = (hourTo === 23) ? $scope.timerHoursTo[0] : $scope.timerHoursTo[hourTo + 1];
      $scope.timerMinutesToSelected = $scope.timerMinutesTo[0];

      // reset task description
      $scope.taskDescription = '';
    }
  }

  // refresh task list in scope after start application
  $scope.refresh();
});

// ---------------------------------------------------------------------
//                       End Angular Application
// ---------------------------------------------------------------------

// ---------------------------------------------------------------------
//                          Editional Functions
// ---------------------------------------------------------------------

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
      id:          modelData[i].id,
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
function isValidTimeRange(beginOfMinutes, endOfMinutes, scope) {
  if(beginOfMinutes > endOfMinutes && endOfMinutes != 0) {
    scope.showError = 'Укажите корректный интервал времени!';
    return false;
  }

  if(beginOfMinutes == endOfMinutes) {
    scope.showError = 'Интервал времени не может составлять 0 минут!';
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
      scope.showError = 'В этом интервале времени у Вас уже есть задачи!';
      return false;
    }
  }
  return true;
}