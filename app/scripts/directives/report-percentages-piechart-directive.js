(function (window, document, angular, VisSense, VisSenseUtils, _, moment, jQuery, undefined) {
  'use strict';

  angular.module('vissensePlayground')

    .directive('tbkVissenseReportPercentagesPiechart', [function () {
      var lastId = 0;
      var d = {
        scope: {
          elementId: '@tbkVissenseReportPercentagesPiechart'
        },
        controller: ['$scope', '$window', '$interval', 'VisSense', function ($scope, $window, $interval, VisSense) {
          $scope.id = 'vissense-report-percentages-piechart-' + lastId++;

          var elementById = document.getElementById($scope.elementId);
          var visobj = new VisSense(elementById, {});

          var metrics = visobj.metrics({
            strategy: new VisSense.VisMon.Strategy.PollingStrategy({interval: 100}),
            visibleUpdateInterval: 1000,
            hiddenUpdateInterval: 1000
          }).start();

          $scope.data = [
            {key: 'hidden', y: 0},
            {key: 'visible', y: 0},
            {key: 'fully visible', y: 0}
          ];

          var _update = _.debounce(function () {
            $scope.$apply(function () {
              $scope.timeHidden = metrics.getMetric('time.hidden').get();
              $scope.timeVisible = metrics.getMetric('time.visible').get();
              $scope.timeFullyVisible = metrics.getMetric('time.fullyvisible').get();

              $scope.duration = metrics.getMetric('time.duration').get();

              $scope.percentageHidden = $scope.timeHidden * 100 / $scope.duration;
              $scope.percentageVisible = ($scope.timeVisible - $scope.timeFullyVisible) * 100 / $scope.duration;
              $scope.percentageFullyVisible = $scope.timeFullyVisible * 100 / $scope.duration;

              $scope.data.push({key: 'hidden', y: $scope.percentageHidden});
              $scope.data.push({key: 'visible', y: $scope.percentageVisible});
              $scope.data.push({key: 'fully visible', y: $scope.percentageFullyVisible});

              //$scope.data[0] = ({ key: "hidden", y: $scope.percentageHidden });
              //$scope.data[1] = ({ key: "visible", y: $scope.percentageVisible });
              //$scope.data[2] = ({ key: "fully visible", y: $scope.percentageFullyVisible });

              $scope.data = _.last($scope.data, 3);
            });
          }, 100);

          var intervalId = $interval(_update, 505);

          $scope.$on('$destroy', function () {
            metrics.stop();
            $interval.cancel(intervalId);
          });

          $scope.xFunction = function () {
            return function (d) {
              return d.key;
            };
          };

          $scope.yFunction = function () {
            return function (d) {
              return d.y;
            };
          };
        }],
        template: '<div style="background-color: white">' +
        '<nvd3-pie-chart' +
        ' data="data"' +
        ' id="{{id}}"' +
        ' x="xFunction()"' +
        ' y="yFunction()"' +
          //' width="250"' +
        ' height="250"' +
        ' showLabels="true"' +
        ' showLegend="true"' +
        ' tooltips="true"' +
        ' labelType="percent"' +
        ' noData="Data not available"' +
        '>' +
        '  <svg height="250"></svg>' +
        '</nvd3-pie-chart>' +
        '</div>'
      };

      return d;
    }]);


})(window, document, angular, VisSense, VisSense.Utils, _, moment, jQuery);
