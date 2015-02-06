(function (window, document, angular, VisSense, VisSenseUtils, _, moment, jQuery, undefined) {
  'use strict';

  angular.module('vissensePlayground')

    .controller('DemoCtrl', [
      '$scope',
      function ($scope) {
        $scope.subtitle = 'demos';

      }]);


})(window, document, angular, VisSense, VisSense.Utils, _, moment, jQuery);
