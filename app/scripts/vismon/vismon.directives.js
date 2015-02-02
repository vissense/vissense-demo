;(function(angular, _, undefined) {
'use strict';

var newVisSenseFromElementId = function(elementId, vissense) {
    var elementById = document.getElementById(elementId);
    var vis = vissense(elementById, {

    });
    return vis;
};

var newMonitor = function(elementId, vissense, config) {
    var vis = newVisSenseFromElementId(elementId, vissense);
    return vis.monitor(config);
};

angular.module('vissensePlayground')


  .directive('tbkVismonState', ['tbkVisSense', '$timeout', function (tbkVisSense, $timeout) {

     var d = {
       scope: {
         elementId: '@tbkVismonState',
         fullyvisible: '@',
         hidden: '@',
         strategy: '@'
       },
       link: function($scope) {
        $timeout(function() {
             var elementById = document.getElementById($scope.elementId);

             var vis = tbkVisSense(elementById, {
                fullyvisible: parseFloat($scope.fullyvisible) || 1,
                hidden: parseFloat($scope.hidden) || 0
             });

             var strategy = new tbkVisSense.VisMon.Strategy.EventStrategy({
                debounce: 20
             });

             if($scope.strategy === 'PollingStrategy') {
                strategy = new tbkVisSense.VisMon.Strategy.PollingStrategy({
                   interval: 250
                });
             }

             var vismon = vis.monitor({
                strategy: strategy,
                visibilitychange: function() {
                    $scope.$apply(function() {
                        $scope.state = vismon.state();
                    });
                }
             });

             setTimeout(function() {
                vismon.start();
             }, 0);

             $scope.$on('$destroy', function() {
                vismon.stop();
             });
         }, 1);
      },
      template: '<span class="label" data-ng-class="{ \'label-success\': state.visible, \'label-danger\': state.hidden}">' +
        '<span data-ng-show="state.visible && !state.fullyvisible">visible</span>' +
        '<span data-ng-show="state.fullyvisible">fully visible</span>' +
        '<span data-ng-show="state.hidden">hidden</span>' +
      '</span>'
    };

     return d;
   }])

  .directive('tbkVismonPercentage', ['tbkVisSense', function (tbkVisSense) {

     var d = {
       scope: {
         elementId: '@tbkVismonPercentage'
       },
       controller: ['$scope', function($scope) {
         $scope.vismon = newMonitor($scope.elementId, tbkVisSense,{
            strategy: new tbkVisSense.VisMon.Strategy.PollingStrategy({
                interval: 100
            }),
            percentagechange: function() {
                var state = $scope.vismon.state();
                $scope.percentage = state.percentage;
            }
         });

         $scope.vismon.start();
         $scope.$on('$destroy', function() {
            $scope.vismon.stop();
         });
      }],
      template: '<span class="label" data-ng-class="{ \'label-success\': percentage > 0, \'label-danger\': !percentage}">' +
        '{{percentage * 100 | number:0}}%' +
      '</span>'
    };

     return d;
   }])
  .directive('tbkVismonPercentageTimeTest', ['tbkVisSense', function (tbkVisSense) {

    var d = {
      scope: {
        elementId: '@tbkVismonPercentageTimeTest',
        timeLimit: '@',
        percentageLimit: '@',
        interval: '@'
      },
      controller: ['$scope', function($scope) {
        $scope.visobj = newVisSenseFromElementId($scope.elementId, tbkVisSense);

        $scope.passed = false;

        $scope.visobj.onPercentageTimeTestPassed(function() {
          $scope.$apply(function() {
            $scope.passed = true;
          });
        }, {
          percentageLimit: $scope.percentageLimit,
          timeLimit: $scope.timeLimit,
          interval: $scope.interval
        });
      }],
      template: '<span>' +
      '{{percentageLimit * 100 | number:0}}/{{timeLimit / 1000 | number:0}} test: ' +
        '<span data-ng-style="{ color : passed ? \'green\' : \'red\'}">{{passed}}</span>' +
      '</span>'
    };

    return d;
  }])
  .directive('tbkVismonFiftyOneTest', [function () {

     var d = {
       scope: {
         elementId: '@tbkVismonFiftyOneTest'
       },
      template: '<span data-tbk-vismon-percentage-time-test="{{elementId}}" ' +
          'data-percentage-limit="0.5" ' +
         'data-time-limit="1000" ' +
         'data-interval="100">' +
      '</span>'
    };

     return d;
   }])

  .directive('tbkVismonSixtyOneTest', [function () {
     var d = {
       scope: {
         elementId: '@tbkVismonSixtyOneTest'
       },
        template: '<span data-tbk-vismon-percentage-time-test="{{elementId}}" ' +
          'data-percentage-limit="0.6" ' +
          'data-time-limit="1000" ' +
          'data-interval="100">' +
        '</span>'
    };

     return d;
   }])

  .directive('tbkVismonStateDebug', ['tbkVisSense', function (tbkVisSense) {
    var d = {
      scope: {
        elementId: '@tbkVismonStateDebug'
      },
      controller: ['$scope', function($scope) {
        $scope.vismon = newVisSenseFromElementId($scope.elementId, tbkVisSense).monitor({
          strategy: new VisSense.VisMon.Strategy.PollingStrategy(),
          update: function(monitor) {
              $scope.state = monitor.state();
          }
        }).start();

        $scope.state = $scope.vismon.state();

        $scope.$on('$destroy', function() {
          $scope.vismon.stop();
        });
      }],
      template: '{{ state | json }}'
    };

    return d;
  }])

  .directive('tbkVissenseDebugUtils', [function() {
    var d = {
      scope: {
        elementId: '@tbkVissenseDebugUtils'
      },
      controller: ['$scope', '$window', '$interval', function($scope, $window, $interval) {

        var element = document.getElementById($scope.elementId);

        var _update = _.debounce(function() {
            var viewport = VisSense.Utils._viewport(element);
            $scope.viewportHeight = viewport.height;
            $scope.viewportWidth = viewport.width;

            var rect = element.getBoundingClientRect();
            $scope.isInViewport = VisSense.Utils._isInViewport(rect, viewport);
            $scope.isVisibleByStyling = VisSense.Utils.isVisibleByStyling(element);
        }, 100);

        _update();

         (function() {
            var intervalId = $interval(_update, 1000);
            $scope.$on('$destroy', function() {
              $interval.cancel(intervalId);
            });
         }());

      }],
      template: '<dl>'+
        '<dt>viewport</dt> <dd>{{viewportWidth  | number:0}}x{{viewportHeight | number:0}}</dd>' +
        '<dt>isInViewport</dt> <dd><span data-tbk-bool-label="isInViewport"></span></dd>' +
        '<dt>isVisibleByStyling</dt> <dd><span data-tbk-bool-label="isVisibleByStyling"></span></dd>' +
      '</dl>'
    };

    return d;
  }])

;

}(angular, _));
