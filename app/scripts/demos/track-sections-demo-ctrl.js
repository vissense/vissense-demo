(function (window, document, angular, jQuery, undefined) {
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
        };

        var changeOpacityOnPercentageChangeOfElementWithId = function (elementId) {
          var sectionElement = jQuery('#' + elementId);

          var onChange = function (state) {
            var newValue = state.percentage;
            var oldValue = (state.previous.percentage || 0);
            var difference = newValue - oldValue;
            var duration = 500 * Math.max(difference, 0.25);

            // set the opacity to the actual visibility percentage
            var opacity = Math.max(newValue, 0.25);
            sectionElement.fadeTo(duration, opacity);
          };

          var sectionMonitor = new VisSense(sectionElement[0]).monitor({
            // update when user scrolls or resizes the page
            strategy: VisSense.VisMon.Strategy.EventStrategy({debounce: 50}),

            percentagechange: function (monitor) {
              onChange(monitor.state());
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


})(window, document, angular, jQuery);
