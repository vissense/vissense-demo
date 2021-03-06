(function (window, document, angular, _, jQuery, undefined) {
  'use strict';

  angular.module('vissensePlayground')
    .controller('NoopCtrl', [
      function () {

      }])

    .controller('GettingStartedCtrl', [
      '$scope',
      function ($scope) {
        $scope.title = 'VisSense.js';

        $scope.scrollToElement = function (id) {
          jQuery('html, body').animate({
            scrollTop: jQuery('#' + id).offset().top
          }, 500);
        };

        $scope.collapse = function (id, mode) {
          jQuery(id).collapse(mode ? mode : 'toggle');
        };

        jQuery('#main-page-affix').affix({
          offset: {
            top: 325,
            bottom: 0
          }
        });
      }]);

})(window, document, angular, _, jQuery);
