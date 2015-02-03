
(function (window, document, angular,  _, jQuery, undefined) {
'use strict';

angular.module('vissensePlayground', [
'tbk.draggable',
'tbk.githubVersion',
'restangular',
'vissense.playground.states',
'nvd3ChartDirectives',
'hljs' // angular-highlight.js
])

.filter('reverse', function() {
  return function(items) {
    return items.slice().reverse();
  };
})

.factory('tbkVisSense', ['$window', function($window) {
	return $window.VisSense;
}])
;


})(window, document, angular, _, jQuery);
