(function (window, document, angular, VisSense, VisSenseUtils, _, moment, jQuery, undefined) {
  'use strict';

  angular.module('vissensePlayground')

    .controller('ManyMonitorsDemoCtrl', [
      '$scope',
      function ($scope) {
        $scope.model = {};

        $scope.model.debugtext = 'text';
        $scope.debug = function() {
          $scope.model.debugtext = 'hello' +
            $scope.model.debugtext;
        };

        $scope.event = function(description, args) {
          console.log(description + ' - ' + args);
          $scope.model.state = $scope.model.state + '+';
          $scope.$digest();
        };
      }]);


})(window, document, angular, VisSense, VisSense.Utils, _, moment, jQuery);
