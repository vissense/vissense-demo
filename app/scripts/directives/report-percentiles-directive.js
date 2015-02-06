(function (window, document, angular, VisSense, VisSenseUtils, _, moment, jQuery, undefined) {
  'use strict';

  angular.module('vissensePlayground')

    .directive('tbkVissenseReportPercentiles', [function () {
      var d = {
        scope: {
          elementId: '@tbkVissenseReportPercentiles'
        },
        controller: ['$scope', '$interval', 'VisSense', function ($scope, $interval, VisSense) {
          var elementById = document.getElementById($scope.elementId);
          var vis = new VisSense(elementById, {});

          var metrics = vis.metrics({
            strategy: new VisSense.VisMon.Strategy.PollingStrategy({interval: 100})
          }).start();

          var _update = function () {
            $scope.percentiles = metrics.getMetric('percentage').percentiles();
          };
          var _debounce_update = _.debounce(function () {
            $scope.$apply(function () {
              _update();
            });
          }, 100);

          var intervalId = $interval(_debounce_update, 200);

          $scope.$on('$destroy', function () {
            metrics.stop();
            $interval.cancel(intervalId);
          });
        }],
        template: '<div style="background-color: white">' +
        '<div>0,1%: {{percentiles["0.001"] * 100 | number: 2}}%</div>' +
        '<div>1%: {{percentiles["0.01"] * 100 | number: 2}}%</div>' +
        '<div>5%: {{percentiles["0.05"] * 100 | number: 2}}%</div>' +
        '<div>25%: {{percentiles["0.25"] * 100 | number: 2}}%</div>' +
        '<div>50%: {{percentiles["0.5"] * 100 | number: 2}}%</div>' +
        '<div>75%: {{percentiles["0.75"] * 100 | number: 2}}%</div>' +
        '<div>90%: {{percentiles["0.9"] * 100 | number: 2}}%</div>' +
        '<div>95%: {{percentiles["0.95"] * 100 | number: 2}}%</div>' +
        '<div>99%: {{percentiles["0.99"] * 100 | number: 2}}%</div>' +
        '<div>99,9%: {{percentiles["0.999"] *100 | number: 2}}%</div>' +
        '</div>'
      };

      return d;
    }]);


})(window, document, angular, VisSense, VisSense.Utils, _, moment, jQuery);
