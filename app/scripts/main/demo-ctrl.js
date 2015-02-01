(function (window, document, angular,  _, moment, jQuery, undefined) {
'use strict';

angular.module('vissensePlayground')



  .directive('tbkVissenseReportPercentiles', [function () {
    var d = {
      scope: {
        elementId: '@tbkVissenseReportPercentiles'
      },
      controller: ['$scope', '$interval', 'tbkVisSense', function($scope, $interval, tbkVisSense) {
        var elementById = document.getElementById($scope.elementId);
        var vis = tbkVisSense(elementById, {

        });

        var metrics = vis.metrics({
          strategy: new VisSense.VisMon.Strategy.PollingStrategy({interval:100})
        }).start();

        var _update = function() {
            $scope.percentiles = metrics.getMetric("percentage").percentiles();
        };
        var _debounce_update = _.debounce(function() {
          $scope.$apply(function() {
            _update();
          });
        }, 100);

         var intervalId = $interval(_debounce_update, 200);

         $scope.$on('$destroy', function() {
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
  }])

  .directive('tbkVissenseReportPercentagesLinechart', [function () {
     var lastId = 0;
     var d = {
       scope: {
         elementId: '@tbkVissenseReportPercentagesLinechart'
       },
       controller: ['$scope', '$interval', 'tbkVisSense', function($scope, $interval, tbkVisSense) {
         $scope.id = 'vissense-report-percentages-linechart-' + lastId++;

         var intervalId = null;
         var started = false;

         var startTime = VisSenseUtils.now();

         var elementById = document.getElementById($scope.elementId);
         var vis = tbkVisSense(elementById, {});


         $scope.data = [{
             key: 'Visibility Percentage',
             values: []
         }];
         var updatePercentage = function() {
             if(!started) { return; }

             var currentPercentage = Math.round(vis.percentage() * 1000) / 10;
             $scope.data[0].values.push([(VisSenseUtils.now() - startTime) / 1000, currentPercentage]);
         };

         vis.monitor().onPercentageChange(_.debounce(updatePercentage, 100));
         vis.timer().every(1000, updatePercentage);

         var _update = function() {
             //updatePercentage();
             //$scope.data[0].values = _.last($scope.data[0].values, 10);
             $scope.data = [VisSenseUtils.extend({}, $scope.data[0])];
         };

         var _debounce_update = _.debounce(function() {
           $scope.$apply(function() {
             _update();
           });
         }, 100);

         $scope.start = function() {
            intervalId = $interval(_debounce_update, 500);
            started = true;
         };
         $scope.stop = function() {
            $interval.cancel(intervalId);
            started = false;
         };

         $scope.$on('$destroy', function() {
            $scope.stop();
         });

       }],
       template: '<div>' +
         '<button class="btn btn-default" data-ng-click="start()">start</button>' +
         '<button class="btn btn-default" data-ng-click="stop()">stop</button>' +
          '<nvd3-line-with-focus-chart ' +
              ' data="data" ' +
              ' id="{{id}}" ' +
              ' height="300" ' +
              ' height2="50" ' +
              ' margin="{left:30,top:30,bottom:20,right:20}" ' +
            '> ' +
           ' <svg></svg> ' +
         '</nvd3-line-with-focus-chart>' +
       '</div>'
     };

     return d;
   }])

  .directive('tbkVissenseCurrentPercentage', [function () {
     var d = {
       scope: {
         elementId: '@tbkVissenseCurrentPercentage'
       },
       controller: ['$scope', '$document', '$interval',  'tbkVisSense', function($scope, $document, $interval, tbkVisSense) {
           var elementById = $document[0].getElementById($scope.elementId);
           var vis = tbkVisSense(elementById, {});

           var _update = function() {
             $scope.percentage = vis.percentage();
           };

           var intervalId = $interval(_update, 200);

           $scope.$on('$destroy', function() {
             $interval.cancel(intervalId);
           });
       }],
       template: '<span>{{percentage * 100 | number:0}}%</span>'
     };

     return d;
   }])

  .directive('tbkVissenseReportPercentages', [function () {
     var d = {
       scope: {
         elementId: '@tbkVissenseReportPercentages'
       },
       controller: ['$scope', '$interval', 'tbkVisSense', function($scope, $interval, tbkVisSense) {

         var elementById = document.getElementById($scope.elementId);
         var vis = tbkVisSense(elementById, {});

         var metrics = vis.metrics({
           strategy: new VisSense.VisMon.Strategy.PollingStrategy({interval:100})
         }).start();

         var _update = function() {
             $scope.percentage = {
                 current: metrics.getMetric('percentage').get(),
                 max: metrics.getMetric('percentage.max').get(),
                 min: metrics.getMetric('percentage.min').get()
             };
         };
         var _debounce_update = _.debounce(function() {
           $scope.$apply(function() {
             _update();
           });
         }, 100);

         var intervalId = $interval(_debounce_update, 200);

         $scope.$on('$destroy', function() {
            metrics.stop();
            $interval.cancel(intervalId);
         });

       }],
       template: '<div style="background-color: white">' +
         '<div>current: {{percentage.current * 100 | number:2}}%</div>' +
         '<div>max: {{percentage.max * 100 | number: 2 }}%</div>' +
         '<div>min: {{percentage.min * 100 | number: 2 }}%</div>' +
       '</div>'
     };

     return d;
   }])

    .directive('tbkDefaultDraggableElement', [function () {
      var d = {
        scope: {
          elementId: '@tbkDefaultDraggableElement'
        },
        controller: ['$scope', function($scope) {
          $scope.model = {
            elementId: $scope.elementId
          };
        }],
        templateUrl: 'partials/directives/default-draggable-element.html'
      };

      return d;
    }])

  .directive('tbkBoolLabel', [function () {
    var lastId = 0;
    var d = {
      scope: {
        v: '=tbkBoolLabel'
      },
      replace:true,
      controller: ['$scope', function($scope) {
      }],
      template: '<span class="label" data-ng-class="{\'label-danger\': !v, \'label-success\': v === true }">{{v}}</span>'
    };

    return d;
  }])

  .directive('tbkVissenseReportTimesBarchart', [function () {
    var lastId = 0;
    var d = {
      scope: {
        elementId: '@tbkVissenseReportTimesBarchart'
      },
      controller: ['$scope', '$window', '$interval', 'tbkVisSense', function($scope, $window, $interval, tbkVisSense) {
        $scope.id = 'vissense-report-times-barchart-' + lastId++;

        var elementById = document.getElementById($scope.elementId);
        var visobj = tbkVisSense(elementById, {});

        var metrics = visobj.metrics({
          strategy: new VisSense.VisMon.Strategy.PollingStrategy({interval:100}),
          visibleUpdateInterval: 1000,
          hiddenUpdateInterval: 1000
        }).start();

        $scope.data = [{
          key: 'Series 1',
          values: [ ]
        }];

        var round = function(val) {
            return Math.round(val / 100) / 10;
        };

        var _update = _.debounce(function() {
            $scope.$apply(function() {
                $scope.timeHidden = round(metrics.getMetric('time.hidden').get())
                $scope.timeVisible = round(metrics.getMetric('time.visible').get());
                $scope.timeFullyVisible = round(metrics.getMetric('time.fullyvisible').get());

                $scope.data = [{
                  key: 'hidden',
                  values: [[0, $scope.timeHidden]]
                }, {
                  key: 'visible',
                  values: [[0, $scope.timeVisible]]
                }, {
                  key: 'fully visible',
                  values: [[0, $scope.timeFullyVisible]]
                }];
            });
        }, 100);

         var intervalId = $interval(_update, 515);

         $scope.$on('$destroy', function() {
            metrics.stop();
            $interval.cancel(intervalId);
         });

          $scope.xFunction = function(){
              return function(d) {
                  return d.key;
              };
          };

          $scope.yFunction = function(){
            return function(d){
                return d.y;
            };
          };
      }],
      template: '<div style="background-color: white">'+
        '<nvd3-multi-bar-chart ' +
        ' data="data"' +
        ' id="exampleId"' +
        //' width="550"' +
        ' height="350"' +
        ' showLabels="true"' +
        ' showLegend="true"' +
        ' tooltips="true"' +
        ' showXAxis="true"' +
        ' showYAxis="true">' +
        '  <svg height="250"></svg>' +
        '</nvd3-multi-bar-chart>' +
      '</div>'
    };

    return d;
  }])

  .directive('tbkVissenseReportPercentagesPiechart', [function () {
    var lastId = 0;
    var d = {
      scope: {
        elementId: '@tbkVissenseReportPercentagesPiechart'
      },
      controller: ['$scope', '$window', '$interval', 'tbkVisSense', function($scope, $window, $interval, tbkVisSense) {
        $scope.id = 'vissense-report-percentages-piechart-' + lastId++;

        var elementById = document.getElementById($scope.elementId);
        var visobj = tbkVisSense(elementById, {});

        var metrics = visobj.metrics({
          strategy: new VisSense.VisMon.Strategy.PollingStrategy({interval:100}),
          visibleUpdateInterval: 1000,
          hiddenUpdateInterval: 1000
        }).start();

        $scope.data = [
            { key: "hidden", y: 0 },
            { key: "visible", y: 0 },
            { key: "fully visible", y: 0 }
        ];

        var _update = _.debounce(function() {
            $scope.$apply(function() {
                $scope.timeHidden = metrics.getMetric('time.hidden').get()
                $scope.timeVisible = metrics.getMetric('time.visible').get();
                $scope.timeFullyVisible = metrics.getMetric('time.fullyvisible').get();

                $scope.duration = metrics.getMetric('time.duration').get();

                $scope.percentageHidden = $scope.timeHidden * 100 / $scope.duration;
                $scope.percentageVisible = ($scope.timeVisible - $scope.timeFullyVisible) * 100 / $scope.duration;
                $scope.percentageFullyVisible = $scope.timeFullyVisible * 100 / $scope.duration;

                $scope.data.push({ key: "hidden", y: $scope.percentageHidden });
                $scope.data.push({ key: "visible", y: $scope.percentageVisible });
                $scope.data.push({ key: "fully visible", y: $scope.percentageFullyVisible });

                //$scope.data[0] = ({ key: "hidden", y: $scope.percentageHidden });
                //$scope.data[1] = ({ key: "visible", y: $scope.percentageVisible });
                //$scope.data[2] = ({ key: "fully visible", y: $scope.percentageFullyVisible });

                $scope.data = _.last($scope.data, 3);
            });
        }, 100);

         var intervalId = $interval(_update, 505);

         $scope.$on('$destroy', function() {
            metrics.stop();
            $interval.cancel(intervalId);
         });

          $scope.xFunction = function(){
              return function(d) {
                  return d.key;
              };
          };

          $scope.yFunction = function(){
            return function(d){
                return d.y;
            };
          };
      }],
      template: '<div style="background-color: white">'+
        '<nvd3-pie-chart' +
            ' data="data"' +
            ' id="{{id}}"' +
            ' x="xFunction()"' +
            ' y="yFunction()"' +
            //' width="250"' +
            ' height="250"' +
            ' showLabels="true"' +
            ' showLegend="true"' +
            ' tooltips="true"' +
            ' labelType="percent"' +
            ' noData="Data not available"' +
        '>' +
            '  <svg height="250"></svg>' +
        '</nvd3-pie-chart>' +
      '</div>'
    };

    return d;
  }])

  .directive('tbkVissenseVisibilityInfocard', [function () {
    var d = {
      scope: {
        elementId: '@tbkVissenseVisibilityInfocard'
      },
      controller: ['$scope', '$window', '$interval', 'tbkVisSense', function($scope, $window, $interval, tbkVisSense) {

        var elementById = document.getElementById($scope.elementId);

        var visobj = tbkVisSense(elementById, {});

        var metrics = visobj.metrics({
          strategy: new VisSense.VisMon.Strategy.PollingStrategy({interval:100})
        }).start();

        var _update = _.debounce(function() {
          $scope.$apply(function() {
            $scope.timeHidden = metrics.getMetric('time.hidden').get();
            $scope.timeVisible = metrics.getMetric('time.visible').get();
            $scope.timeFullyVisible = metrics.getMetric('time.fullyvisible').get();
            $scope.timeRelativeVisible = metrics.getMetric('time.relativeVisible').get();
            $scope.duration = metrics.getMetric('time.duration').get();

            $scope.percentage = {
              current: metrics.getMetric('percentage').get(),
              max: metrics.getMetric('percentage.max').get(),
              min: metrics.getMetric('percentage.min').get()
            };
          });
        }, 0);

        var intervalId = $interval(_update, 200);

        $scope.$on('$destroy', function() {
          metrics.stop();
          $interval.cancel(intervalId);
        });

      }],
      templateUrl : 'partials/directives/visibility-infocard.html'
    };

    return d;
  }])



.controller('DemoCtrl', [
'$scope',
function ($scope) {
    $scope.subtitle = 'demos';

}])
.controller('TrackSectionsDemoCtrl', [
'$window',
'$document',
'$scope',
function ($window, $document, $scope) {

  $scope.scrollToElement = function(elementId) {
    $('html, body').animate({
      scrollTop: jQuery('#' + elementId).offset().top
    }, 500);
    //$window.scrollTo(0, top);
  };

  var changeOpacityOnPercentageChangeOfElementWithId = function(elementId) {
    var sectionElement = jQuery('#' + elementId);

    var onChange = function(monitor) {
      var newValue = monitor.state().percentage;
      var oldValue = (monitor.state().previous.percentage || 0);
      var difference = newValue - oldValue;
      var duration = 500 * Math.max(difference, 0.5);

      // set the opacity to the actual visibility percentage
      var opacity = Math.max(newValue, 0.25);
      sectionElement.fadeTo(duration, opacity);
    };

    var sectionMonitor = VisSense(sectionElement[0]).monitor({
      // update when user scrolls or resizes the page
      strategy : VisSense.VisMon.Strategy.EventStrategy({ debounce: 50 }),

      percentagechange: function(newValue, oldValue, monitor) {
        onChange(monitor);
      }
    }).start();

    $scope.$on('$destroy', function() {
      sectionMonitor.stop();
    });
  };

  changeOpacityOnPercentageChangeOfElementWithId('examples-section');
  changeOpacityOnPercentageChangeOfElementWithId('demo-section');
  changeOpacityOnPercentageChangeOfElementWithId('plugins-section');
}])

.controller('TrackVisiblityDemoCtrl', [
'$window',
'$scope',
'$interval',
'$timeout',
'tbkVisSense',
function ($window, $scope, $interval, $timeout, tbkVisSense) {

	$scope.tbkVisSense = tbkVisSense;

}])

.controller('SingleCtrl', [
'$scope',
function ($scope) {

}])

.controller('FireCallbacksDemoCtrl', [
'$log',
'$scope',
'$interval',
'$timeout',
'tbkVisSense',
function ($log, $scope, $interval, $timeout, tbkVisSense) {

    $scope.model = {
        events: []
    };

    var addEvent = function(name, description) {
        $scope.model.events.push({
            time: Date.now(),
            name: name,
            description: description
        });

        $scope.model.events = _.last($scope.model.events, 100);
    };

    var addEventDigest = function(name, description) {
        $scope.$apply(function() {
            addEvent(name, description);
        });
    };

    var element = document.getElementById('example1');
    var visobj = new VisSense(element);

    var vismon = visobj.monitor({
        strategy: new VisSense.VisMon.Strategy.PollingStrategy(1000),
        fullyvisible: function() {
            addEvent('fullyvisible', 'Element became fully visible')
        },
        hidden: function() {
            addEvent('hidden', 'Element became hidden');
        },
        visible: function() {
            addEvent('visible', 'Element became visible');
        },
        update: function() {
            setTimeout(function() { $scope.$digest(); });
            $log.info('update!');
        },
        percentagechange: function(newValue, oldValue) {
            var o = angular.isNumber(oldValue) ? Math.round(oldValue * 1000) / 10: '?';
            var n = Math.round(newValue * 1000) / 10;
            addEvent('percentagechange', 'Element\'s percentage changed! ' + o + '% -> ' + n + '%');
            $log.info('percentagechange! ' + o + '% -> ' + n + '%');
        },
        visibilitychange: function() {
            addEvent('visibilitychange', 'Element\'s visibility changed!');
        }
    }).start();

    $scope.$on('$destory', function() {
        vismon.stop();
    });
}]);


})(window, document, angular, _, moment, jQuery);
