(function (window, document, angular, VisSense, VisSenseUtils, _, moment, jQuery, undefined) {
  'use strict';

  angular.module('vissensePlayground')

    .directive('tbkVissenseReportPercentagesLinechart', [function () {
      var lastId = 0;
      var d = {
        scope: {
          elementId: '@tbkVissenseReportPercentagesLinechart'
        },
        controller: ['$scope', '$interval', 'VisSense', function ($scope, $interval, VisSense) {
          $scope.id = 'vissense-report-percentages-linechart-' + lastId++;

          var intervalId = null;
          var started = false;

          var startTime = VisSenseUtils.now();

          var elementById = document.getElementById($scope.elementId);
          var vis = new VisSense(elementById, {});


          $scope.data = [{
            key: 'Visibility Percentage',
            values: []
          }];
          var updatePercentage = function () {
            if (!started) {
              return;
            }

            var currentPercentage = Math.round(vis.percentage() * 1000) / 10;
            $scope.data[0].values.push([(VisSenseUtils.now() - startTime) / 1000, currentPercentage]);
          };

          vis.monitor().onPercentageChange(_.debounce(updatePercentage, 100));
          vis.timer().every(1000, updatePercentage);

          var _update = function () {
            //updatePercentage();
            //$scope.data[0].values = _.last($scope.data[0].values, 10);
            $scope.data = [VisSenseUtils.extend({}, $scope.data[0])];
          };

          var _debounce_update = _.debounce(function () {
            $scope.$apply(function () {
              _update();
            });
          }, 100);

          $scope.start = function () {
            intervalId = $interval(_debounce_update, 500);
            started = true;
          };
          $scope.stop = function () {
            $interval.cancel(intervalId);
            started = false;
          };

          $scope.$on('$destroy', function () {
            $scope.stop();
          });

        }],
        template: '<div>' +
        '<button class="btn btn-default" data-ng-click="start()">start</button>' +
        '<button class="btn btn-default" data-ng-click="stop()">stop</button>' +
        '<nvd3-line-with-focus-chart ' +
        ' data="data" ' +
        ' id="{{id}}" ' +
        ' height="300" ' +
        ' height2="50" ' +
        ' margin="{left:30,top:30,bottom:20,right:20}" ' +
        '> ' +
        ' <svg></svg> ' +
        '</nvd3-line-with-focus-chart>' +
        '</div>'
      };

      return d;
    }]);


})(window, document, angular, VisSense, VisSense.Utils, _, moment, jQuery);
