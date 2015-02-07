(function (window, document, angular, VisSense, VisSenseUtils, _, moment, jQuery, undefined) {
  'use strict';

  angular.module('vissensePlayground')

    .controller('ManyMonitorsDemoCtrl', [
      '$scope',
      '$log',
      function ($scope, $log) {
        $scope.model = {
          monitorCount: 42,
          monitorCountMax: 200
        };

        $scope.model.logEvent = function(description) {
          $log.info(description);
        };
      }]);


})(window, document, angular, VisSense, VisSense.Utils, _, moment, jQuery);
