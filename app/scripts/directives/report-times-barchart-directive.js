(function (window, document, angular, VisSense, VisSenseUtils, _, moment, jQuery, undefined) {
  'use strict';

  angular.module('vissensePlayground')

    .directive('tbkVissenseReportTimesBarchart', [function () {
      var lastId = 0;
      var d = {
        scope: {
          elementId: '@tbkVissenseReportTimesBarchart'
        },
        controller: ['$scope', '$window', '$interval', 'VisSense', function ($scope, $window, $interval, VisSense) {
          $scope.id = 'vissense-report-times-barchart-' + lastId++;

          var elementById = document.getElementById($scope.elementId);
          var visobj = new VisSense(elementById, {});

          var metrics = visobj.metrics({
            strategy: new VisSense.VisMon.Strategy.PollingStrategy({interval: 100}),
            visibleUpdateInterval: 1000,
            hiddenUpdateInterval: 1000
          }).start();

          $scope.data = [{
            key: 'Series 1',
            values: []
          }];

          var round = function (val) {
            return Math.round(val / 100) / 10;
          };

          var _update = _.debounce(function () {
            $scope.$apply(function () {
              $scope.timeHidden = round(metrics.getMetric('time.hidden').get());
              $scope.timeVisible = round(metrics.getMetric('time.visible').get());
              $scope.timeFullyVisible = round(metrics.getMetric('time.fullyvisible').get());

              $scope.data = [{
                key: 'hidden',
                values: [[0, $scope.timeHidden]]
              }, {
                key: 'visible',
                values: [[0, $scope.timeVisible]]
              }, {
                key: 'fully visible',
                values: [[0, $scope.timeFullyVisible]]
              }];
            });
          }, 100);

          var intervalId = $interval(_update, 515);

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
        '<nvd3-multi-bar-chart ' +
        ' data="data"' +
        ' id="exampleId"' +
          //' width="550"' +
        ' height="350"' +
        ' showLabels="true"' +
        ' showLegend="true"' +
        ' tooltips="true"' +
        ' showXAxis="true"' +
        ' showYAxis="true">' +
        '  <svg height="250"></svg>' +
        '</nvd3-multi-bar-chart>' +
        '</div>'
      };

      return d;
    }]);


})(window, document, angular, VisSense, VisSense.Utils, _, moment, jQuery);
