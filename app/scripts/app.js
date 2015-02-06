
(function (angular) {
'use strict';

angular.module('vissensePlayground', [
'angular-vissense',
'angular-vissense.directives.debug',
'tbk.draggable',
'tbk.githubVersion',
'restangular',
'vissense.playground.states',
'nvd3ChartDirectives',
'hljs' // angular-highlight.js
])

.filter('reverse', function() {
  return function(items) {
    return items ? items.slice().reverse() : items;
  };
})
;


})(angular);
