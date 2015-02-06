(function (window, document, angular, VisSense, VisSenseUtils, _, moment, jQuery, undefined) {
  'use strict';

  angular.module('vissensePlayground')

    .controller('FireCallbacksDemoCtrl', [
      '$log',
      '$scope',
      function ($log, $scope) {

        $scope.model = {
          events: []
        };

        $scope.addEvent = function (name, description) {
          $scope.model.events.push({
            time: Date.now(),
            name: name,
            description: description
          });

          $scope.model.events = _.last($scope.model.events, 100);
        };

        $scope.addPercentageEvent = function (newValue, oldValue) {
          var o = angular.isNumber(oldValue) ? Math.round(oldValue * 1000) / 10 : '?';
          var n = Math.round(newValue * 1000) / 10;
          $scope.addEvent('percentagechange', 'Element\'s percentage changed! ' + o + '% -> ' + n + '%');
        };
      }]);


})(window, document, angular, VisSense, VisSense.Utils, _, moment, jQuery);
