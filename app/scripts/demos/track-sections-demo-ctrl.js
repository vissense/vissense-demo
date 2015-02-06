(function (window, document, angular, VisSense, VisSenseUtils, _, moment, jQuery, undefined) {
  'use strict';

  angular.module('vissensePlayground')

    .controller('TrackSectionsDemoCtrl', [
      '$window',
      '$document',
      '$scope',
      'VisSense',
      function ($window, $document, $scope, VisSense) {

        $scope.scrollToElement = function (elementId) {
          jQuery('html, body').animate({
            scrollTop: jQuery('#' + elementId).offset().top
          }, 500);
          //$window.scrollTo(0, top);
        };

        var changeOpacityOnPercentageChangeOfElementWithId = function (elementId) {
          var sectionElement = jQuery('#' + elementId);

          var onChange = function (monitor) {
            var newValue = monitor.state().percentage;
            var oldValue = (monitor.state().previous.percentage || 0);
            var difference = newValue - oldValue;
            var duration = 500 * Math.max(difference, 0.25);

            // set the opacity to the actual visibility percentage
            var opacity = Math.max(newValue, 0.25);
            sectionElement.fadeTo(duration, opacity);
          };

          var sectionMonitor = new VisSense(sectionElement[0]).monitor({
            // update when user scrolls or resizes the page
            strategy: VisSense.VisMon.Strategy.EventStrategy({debounce: 50}),

            percentagechange: function (newValue, oldValue, monitor) {
              onChange(monitor);
            }
          }).start();

          $scope.$on('$destroy', function () {
            sectionMonitor.stop();
          });
        };

        changeOpacityOnPercentageChangeOfElementWithId('examples-section');
        changeOpacityOnPercentageChangeOfElementWithId('demo-section');
        changeOpacityOnPercentageChangeOfElementWithId('plugins-section');
      }]);


})(window, document, angular, VisSense, VisSense.Utils, _, moment, jQuery);
